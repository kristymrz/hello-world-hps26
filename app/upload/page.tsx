"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';

export default function UploadPage() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setUserEmail(user.email);
      }
    }
    checkUser();
  }, [supabase, router]);

  const getToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Authentication session not found. Please sign in again.');
    }
    return session.access_token;
  };

  const getPresignedUrl = async (token: string, contentType: string) => {
    console.log('[1/4] getPresignedUrl: requesting presigned URL for contentType:', contentType);
    const response = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentType }),
    });

    console.log('[1/4] getPresignedUrl: response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[1/4] getPresignedUrl: error response body:', errorData);
      throw new Error(errorData.message || `Failed to generate upload URL: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[1/4] getPresignedUrl: success, cdnUrl:', data.cdnUrl, '| presignedUrl present:', !!data.presignedUrl);
    return {
      presignedUrl: data.presignedUrl as string,
      cdnUrl: data.cdnUrl as string,
    };
  };

  const uploadToS3 = async (presignedUrl: string, file: File) => {
    console.log('[2/4] uploadToS3: uploading file', file.name, '(', file.size, 'bytes,', file.type, ')');
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    console.log('[2/4] uploadToS3: response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[2/4] uploadToS3: error response body:', errorText);
      throw new Error(`Failed to upload file to S3: ${response.statusText}`);
    }
    console.log('[2/4] uploadToS3: upload successful');
  };

  const registerImage = async (token: string, cdnUrl: string) => {
    console.log('[3/4] registerImage: registering cdnUrl:', cdnUrl);
    const response = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: cdnUrl,
        isCommonUse: false
      }),
    });

    console.log('[3/4] registerImage: response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[3/4] registerImage: error response body:', errorData);
      throw new Error(errorData.message || `Failed to register image: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[3/4] registerImage: success, imageId:', data.imageId, '| full response:', data);
    return data.imageId as string;
  };

  const generateCaptionsRequest = async (token: string, imageId: string) => {
    console.log('[4/4] generateCaptionsRequest: requesting captions for imageId:', imageId);
    const response = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId }),
    });

    console.log('[4/4] generateCaptionsRequest: response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[4/4] generateCaptionsRequest: error response body:', errorData);
      throw new Error(errorData.message || `Failed to generate captions: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[4/4] generateCaptionsRequest: success, result type:', typeof result, '| isArray:', Array.isArray(result), '| raw result:', result);
    return result;
  };

  const handleGenerateCaptions = async () => {
    if (!selectedFile) return;

    setError(null);
    setCaptions([]);

    try {
      console.log('[pipeline] starting caption generation for file:', selectedFile.name);
      const token = await getToken();
      console.log('[pipeline] token acquired, length:', token.length);

      setPipelineStep('Generating presigned URL...');
      const { presignedUrl, cdnUrl } = await getPresignedUrl(token, selectedFile.type);

      setPipelineStep('Uploading image bytes...');
      await uploadToS3(presignedUrl, selectedFile);

      setPipelineStep('Registering image...');
      const imageId = await registerImage(token, cdnUrl);

      setPipelineStep('Generating captions...');
      const result = await generateCaptionsRequest(token, imageId);

      console.log('[pipeline] setting captions, count:', Array.isArray(result) ? result.length : 'not an array');
      setCaptions(Array.isArray(result) ? result : []);
      if (!Array.isArray(result)) {
        console.warn('[pipeline] expected array of captions but got:', result);
      }
    } catch (err: any) {
      console.error('[pipeline] error:', err);
      setError(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setPipelineStep(null);
    }
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
      setCaptions([]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setCaptions([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#571F43] text-white">
      <Navbar userEmail={userEmail} />
      <main className="upload-main flex-grow flex flex-col items-center gap-12 max-w-6xl mx-auto w-full">
        
        {/* Section 2: Results Wrapper */}
        {captions.length > 0 && previewUrl && (
          <div
            className="upload-results w-full max-w-[630px] flex flex-col items-center border-[4px] border-[#e0a9cc] animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ borderRadius: '0', marginBottom: '48px' }}
          >
            <div className="w-full flex flex-col items-center mb-8">
              <div className="border-[4px] border-white overflow-hidden bg-[#7D2C60] w-full p-4" style={{ maxWidth: '400px' }}>
                <img src={previewUrl} alt="Processed" className="w-full h-auto block border-2 border-white" />
              </div>
            </div>
            <div className="flex flex-col gap-6 w-full">
              <h2 className="font-bold uppercase text-white m-0 text-center" style={{ fontSize: '32px' }}>
                CAPTIONS
              </h2>
              <div className="flex flex-col gap-4">
                {captions.map((cap, index) => (
                  <div key={index} className="border-[2px] border-white p-4 bg-[#7D2C60] flex flex-col items-center justify-center text-center">
                    <p className="text-white m-0 font-semibold" style={{ fontSize: '23px' }}>
                      {typeof cap === 'string' ? cap : cap.content || JSON.stringify(cap)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Upload Logic Wrapper */}
        <div
          className="upload-wrapper w-full max-w-[630px] flex flex-col items-center border-[4px] border-[#e0a9cc]"
          style={{ borderRadius: '0' }}
        >
          {/* Header Text Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="font-bold uppercase text-white leading-none m-0" style={{ fontSize: '40px' }}>
              UPLOAD YOUR OWN PICTURE HERE
            </h2>
            <p className="text-white opacity-90 m-0" style={{ fontSize: '20px', marginTop: '-12px' }}>
              Upload a .png, .jpeg, .jpg, .webp, .gif, or .heic to generate funny captions
            </p>
          </div>

          {/* Upload Zone Wrapper */}
          <div className="flex flex-col items-center w-full mt-12">
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className="relative transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center overflow-hidden mb-12"
              style={{
                width: '100%',
                maxWidth: '400px',
                minHeight: '300px',
                border: '4px dashed',
                borderColor: isDragOver ? '#EAB308' : '#ffffff',
                backgroundColor: isDragOver ? 'rgba(251, 255, 161, 0.3)' : '#7D2C60',
                padding: selectedFile ? '20px' : '64px'
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={onFileSelect}
                className="hidden" 
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
              />

              {!selectedFile ? (
                <>
                  <svg width="80" height="80" viewBox="0 0 20 20" fill="white" className="mb-6 pointer-events-none">
                    <rect x="9" y="2" width="2" height="2" />
                    <rect x="7" y="4" width="6" height="2" />
                    <rect x="5" y="6" width="10" height="2" />
                    <rect x="8" y="8" width="4" height="8" />
                    <rect x="4" y="18" width="12" height="2" />
                  </svg>
                  <h2 className="font-bold uppercase text-white mb-2 pointer-events-none m-0" style={{ fontSize: '28px' }}>
                    DRAG IMAGE HERE
                  </h2>
                  <p className="text-white pointer-events-none m-0" style={{ fontSize: '16px' }}>
                    or click to select
                  </p>
                </>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <button 
                    onClick={clearSelection}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white text-[#571F43] font-bold text-2xl z-20 hover:opacity-80 transition-opacity border-2 border-white"
                  >
                    X
                  </button>
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-48 object-contain mb-4 border-2 border-white"
                    />
                  )}
                  <div className="text-center font-bold uppercase text-white px-4 overflow-hidden text-ellipsis whitespace-nowrap w-full" style={{ fontSize: '18px' }}>
                    {selectedFile.name}
                  </div>
                  <div className="text-white opacity-70" style={{ fontSize: '14px' }}>
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex flex-col items-center gap-4 mt-[15px] mb-[15px]">
                <button
                  onClick={handleGenerateCaptions}
                  disabled={pipelineStep !== null}
                  className="px-12 py-4 bg-white text-[#571F43] font-bold uppercase border-none hover:bg-[#EAB308] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '24px', borderRadius: '8px' }}
                >
                  {pipelineStep ? 'PROCESSING...' : 'GENERATE CAPTIONS'}
                </button>
                {pipelineStep && (
                  <p className="font-bold text-white m-0" style={{ fontSize: '18px' }}>
                    {pipelineStep}
                  </p>
                )}
                {error && (
                  <p className="font-bold text-red-400 text-center m-0" style={{ fontSize: '18px' }}>
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
