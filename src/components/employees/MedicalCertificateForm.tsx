
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, PlusCircle, Paperclip, Camera, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';
import CertificateScanner from './CertificateScanner';
import { getStorageInstance } from '@/lib/firebase-client';
import { ref, uploadString, getDownloadURL, deleteObject, uploadBytes } from 'firebase/storage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const certificateSchema = z.object({
  certificateDate: z.date({ required_error: "Data do atestado é obrigatória." }),
  days: z.coerce.number().min(0, "Número de dias deve ser positivo."),
  isHalfDay: z.boolean().default(false),
  originalReceived: z.boolean().default(false),
  cid: z.string().optional(),
  file: z.any()
    .optional()
    .refine((files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Tamanho máximo do arquivo é 5MB.`)
    .refine((files) => !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Apenas formatos .jpg, .jpeg, .png e .webp são aceitos."),
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
  onAddCertificate: (certificate: Omit<MedicalCertificate, 'id'>) => void;
}

export default function MedicalCertificateForm({ employeeId, onAddCertificate }: MedicalCertificateFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificateDate: new Date(),
      days: 1,
      isHalfDay: false,
      originalReceived: false,
      cid: '',
    },
  });
  
  const fileList = form.watch('file');
  const attachedFileName = fileList?.[0]?.name || (scannedImageUri ? 'imagem_escaneada.jpg' : '');

  const onSubmit = async (values: CertificateFormValues) => {
    setIsSubmitting(true);
    let fileURL: string | null = null;
    const storage = getStorageInstance();

    try {
        let fileToUpload: File | string | undefined = undefined;
        if (scannedImageUri) {
          fileToUpload = scannedImageUri;
        } else if (values.file && values.file.length > 0) {
          fileToUpload = values.file[0];
        }

        if (fileToUpload) {
            const fileName = `certificates/${employeeId}/${Date.now()}-${attachedFileName || 'capture.jpg'}`;
            const storageRef = ref(storage, fileName);

            if (typeof fileToUpload === 'string') {
                // It's a data URI from the scanner
                await uploadString(storageRef, fileToUpload, 'data_url');
            } else {
                // It's a File object from input
                await uploadBytes(storageRef, fileToUpload);
            }
            fileURL = await getDownloadURL(storageRef);
            toast({ title: "Upload Concluído", description: "O anexo do atestado foi salvo." });
        }
        
        const certificateData: Omit<MedicalCertificate, 'id'> = {
          employeeId,
          certificateDate: values.certificateDate.toISOString(),
          days: values.isHalfDay ? 0.5 : values.days,
          isHalfDay: values.isHalfDay,
          originalReceived: values.originalReceived,
          fileURL: fileURL,
          cid: values.cid || undefined,
        };
        
        onAddCertificate(certificateData);
        
        form.reset();
        setScannedImageUri(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    } catch (error) {
        console.error("Failed to upload file or add certificate:", error);
        toast({ variant: 'destructive', title: 'Erro no Upload', description: 'Não foi possível salvar o anexo do atestado.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCapture = (imageUri: string) => {
    setScannedImageUri(imageUri);
    form.setValue('file', null); // Clear file input if scan is used
    setIsScannerOpen(false);
    toast({ title: "Imagem Capturada", description: "A imagem do atestado foi capturada com sucesso." });
  }

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
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={ptBR}
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

        <FormField
            control={form.control}
            name="cid"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                    CID (Opcional)
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">
                                    O código CID (ex: J06.9) ajuda a agrupar atestados da mesma doença. Deixe em branco se não souber.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ex: J06.9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <FormLabel>Atestado de meio turno</FormLabel>
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
                    <FormLabel>Original recebido</FormLabel>
                    </div>
                </FormItem>
                )}
            />
        </div>
        
        <FormItem>
          <FormLabel>Anexar Atestado</FormLabel>
           <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                 <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*"
                      className="cursor-pointer"
                      ref={fileInputRef}
                      onChange={(e) => {
                          field.onChange(e.target.files);
                          setScannedImageUri(null);
                      }}
                     />
                 </FormControl>
               )}
            />

          <div className="flex flex-col sm:flex-row gap-2 items-center mt-2">
            <p className="text-sm text-muted-foreground">Ou</p>
            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" /> Escanear com a Câmera
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Escanear Atestado Médico</DialogTitle>
                </DialogHeader>
                <CertificateScanner onCapture={handleCapture} />
              </DialogContent>
            </Dialog>
            
          </div>
          {attachedFileName && <FormMessage className="text-muted-foreground mt-2">Arquivo selecionado: {attachedFileName}</FormMessage>}
          <FormMessage />
        </FormItem>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atestado
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
