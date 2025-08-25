
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Separator } from '../ui/separator';

interface CertificateScannerProps {
  onCapture: (imageUri: string) => void;
}

export default function CertificateScanner({ onCapture }: CertificateScannerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (hasCameraPermission === true) return;
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        setStream(cameraStream);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acesso à Câmera Negado',
          description: 'Por favor, habilite o acesso à câmera nas configurações do seu navegador.',
        });
      }
    };

    getCameraPermission();

    // Cleanup function to stop the camera stream when the component unmounts
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, []); // Run only once

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUri = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUri);

      // Stop the video stream after capture
       if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
     const getCameraPermission = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(cameraStream);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  if (hasCameraPermission === false) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro de Permissão</AlertTitle>
        <AlertDescription>
          Não foi possível acessar a câmera. Por favor, verifique as permissões no seu navegador e tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasCameraPermission === null) {
      return <div className="text-center p-4">Solicitando permissão da câmera...</div>
  }


  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
        {capturedImage ? (
           <img src={capturedImage} alt="Atestado capturado" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        )}
      </div>
      <Separator />
      <div className="flex justify-center gap-4">
        {capturedImage ? (
          <>
            <Button variant="outline" onClick={handleRetake}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Tentar Novamente
            </Button>
            <Button onClick={handleConfirm}>
              <Camera className="mr-2 h-4 w-4" /> Confirmar Imagem
            </Button>
          </>
        ) : (
          <Button onClick={handleCapture} disabled={!hasCameraPermission}>
            <Camera className="mr-2 h-4 w-4" /> Capturar Foto
          </Button>
        )}
      </div>
       <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
