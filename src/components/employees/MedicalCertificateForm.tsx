
"use client";

import type { MedicalCertificate } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const certificateSchema = z.object({
  certificateDate: z.date({ required_error: "Data do atestado é obrigatória." }),
  days: z.coerce.number().min(0, "Número de dias deve ser positivo."),
  isHalfDay: z.boolean().default(false),
  originalReceived: z.boolean().default(false),
  file: z.any()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Tamanho máximo do arquivo é 5MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas formatos .jpg, .jpeg, .png e .webp são aceitos."),
}).refine(data => !data.isHalfDay || (data.days <= 1 && data.days > 0), {
    message: "Atestado de meio turno deve ser de no máximo 1 dia.",
    path: ['days'],
}).refine(data => data.isHalfDay ? data.days > 0 : true, {
    message: "Atestado de meio turno deve ter duração.",
    path: ['days']
});


type CertificateFormValues = z.infer<typeof certificateSchema>;

interface MedicalCertificateFormProps {
  employeeId: string;
  onAddCertificate: (certificate: MedicalCertificate) => void;
}

export default function MedicalCertificateForm({ employeeId, onAddCertificate }: MedicalCertificateFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificateDate: new Date(),
      days: 1,
      isHalfDay: false,
      originalReceived: false,
    },
  });

  const onSubmit = (values: CertificateFormValues) => {
    const processSubmit = (fileDataUri: string | null) => {
      const certificateData: MedicalCertificate = {
        id: crypto.randomUUID(),
        employeeId,
        certificateDate: values.certificateDate.toISOString(),
        days: values.isHalfDay ? 0.5 : values.days,
        isHalfDay: values.isHalfDay,
        originalReceived: values.originalReceived,
        fileDataUri: fileDataUri,
      };
      
      onAddCertificate(certificateData);
      toast({ title: "Atestado Adicionado", description: "Novo atestado registrado com sucesso." });
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    
    if (values.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processSubmit(e.target?.result as string);
      };
      reader.readAsDataURL(values.file);
    } else {
      processSubmit(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-muted/50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="certificateDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Atestado</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-background",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº de Dias</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Nº de dias" {...field} disabled={form.watch('isHalfDay')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center space-x-4">
            <FormField
                control={form.control}
                name="isHalfDay"
                render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-3">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if(checked) {
                                form.setValue('days', 0.5);
                            } else {
                                form.setValue('days', 1);
                            }
                        }}
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>Atestado de meio turno?</FormLabel>
                    </div>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="originalReceived"
                render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-3">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>Original recebido?</FormLabel>
                    </div>
                </FormItem>
                )}
            />
        </div>
         <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Anexar Atestado (Imagem)</FormLabel>
              <FormControl>
                 <Input 
                   type="file" 
                   accept="image/*"
                   onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} 
                   className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                   ref={fileInputRef}
                   {...rest}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atestado
        </Button>
      </form>
    </Form>
  );
}
