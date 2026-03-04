import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ELITE_API_URL } from '@/config/api';
import {
  Upload,
  Camera,
  ChevronLeft,
  Check,
  Clock,
  ShieldCheck,
  Loader2,
  ImageUp,
  X,
  ShieldAlert,
} from 'lucide-react';

const ID_TYPES = [
  { value: 'sa_id_book', label: 'SA ID Book', hasBack: true },
  { value: 'sa_id_card', label: 'SA ID Card', hasBack: true },
  { value: 'passport', label: 'Passport', hasBack: false },
  { value: 'drivers_license', label: "Driver's License", hasBack: true },
];

const STEPS = [1, 2, 3, 4];

const ProgressBar = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {STEPS.map((s) => (
      <div key={s} className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
            s < current
              ? 'bg-[#FFCB32] text-gray-900'
              : s === current
                ? 'bg-[#FFCB32] text-gray-900'
                : 'bg-gray-200 text-gray-500'
          }`}
        >
          {s < current ? <Check className="w-4 h-4" /> : s}
        </div>
        {s < 4 && (
          <div
            className={`w-8 h-0.5 ${
              s < current ? 'bg-[#FFCB32]' : 'bg-gray-200'
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const UploadArea = ({ label, required, file, onFileChange, onClear }) => {
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files?.[0];
      if (dropped && dropped.type.startsWith('image/')) {
        onFileChange(dropped);
      }
    },
    [onFileChange],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  if (file) {
    return (
      <div className="relative border-2 border-[#FFCB32] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <img
            src={URL.createObjectURL(file)}
            alt={label}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-300 hover:border-[#FFCB32] rounded-xl p-6 cursor-pointer transition-colors text-center"
    >
      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Click to upload or drag & drop
      </p>
      <p className="text-xs text-gray-400 mt-0.5">
        JPG, PNG or WebP (max 10MB)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
          e.target.value = '';
        }}
      />
    </div>
  );
};

const ApprovedState = () => (
  <div className="text-center py-8">
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
      <ShieldCheck className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
      Identity Verified!
    </h2>
    <span className="inline-flex items-center gap-1.5 bg-[#FFCB32] text-gray-900 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
      <Check className="w-4 h-4" />
      Verified Seller
    </span>
    <p className="text-gray-600 mb-8">
      Your account now has Verified Seller status.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link
        to="/marketplace"
        className="inline-flex items-center justify-center bg-[#FFCB32] text-gray-900 font-medium rounded-full px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Go to Marketplace
      </Link>
      <Link
        to="/portfolio"
        className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium rounded-full px-6 py-2.5 hover:bg-gray-50 active:scale-[0.98] transition-all"
      >
        View Portfolio
      </Link>
    </div>
  </div>
);

const AdminState = () => (
  <div className="text-center py-8">
    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
      <ShieldAlert className="w-10 h-10 text-red-600" />
    </div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
      Administrator Access
    </h2>
    <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
      ⚡ Admin
    </span>
    <p className="text-gray-600 mb-8">
      Your account has full administrator access. All features are unlocked.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link
        to="/admin"
        className="inline-flex items-center justify-center bg-gray-900 text-white font-medium rounded-full px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Admin Dashboard
      </Link>
      <Link
        to="/marketplace"
        className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium rounded-full px-6 py-2.5 hover:bg-gray-50 active:scale-[0.98] transition-all"
      >
        Marketplace
      </Link>
    </div>
  </div>
);

const UnderReviewState = ({ submittedAt }) => (
  <div className="text-center py-8">
    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
      <Clock className="w-10 h-10 text-amber-600" />
    </div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
      Verification Under Review
    </h2>
    <p className="text-gray-600 mb-4">
      Your documents are being reviewed. This typically takes under 24 hours.
    </p>
    {submittedAt && (
      <p className="text-sm text-gray-500 mb-8">
        Submitted{' '}
        {new Date(submittedAt).toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    )}
    <Link
      to="/"
      className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium rounded-full px-6 py-2.5 hover:bg-gray-50 active:scale-[0.98] transition-all"
    >
      Return Home
    </Link>
  </div>
);

const Verify = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getToken, isAdmin, isVerifiedSeller, loading: authLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);

  const [step, setStep] = useState(1);
  const [idType, setIdType] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const selectedIdType = ID_TYPES.find((t) => t.value === idType);
  const showBack = selectedIdType?.hasBack ?? false;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/verify', { replace: true });
      return;
    }
    if (isAdmin) {
      setVerificationStatus('admin');
      setPageLoading(false);
      return;
    }
    if (isVerifiedSeller) {
      setVerificationStatus('approved');
      setPageLoading(false);
      return;
    }

    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const token = await getToken();
        if (!token) {
          navigate('/login?redirect=/verify', { replace: true });
          return;
        }
        const res = await fetch(
          `${ELITE_API_URL}/api/user/verification/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error('Failed to fetch verification status');
        const data = await res.json();
        if (cancelled) return;
        setVerificationStatus(data.status || 'none');
        if (data.submitted_at) setSubmittedAt(data.submitted_at);
      } catch {
        if (!cancelled) setVerificationStatus('none');
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };
    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, isAdmin, isVerifiedSeller, getToken, navigate]);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError(true);
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (step === 3 && !selfieFile) {
      startCamera();
    }
    if (step !== 3) {
      stopCamera();
    }
    return () => {
      if (step === 3) stopCamera();
    };
  }, [step, selfieFile, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setSelfieFile(file);
          stopCamera();
        }
      },
      'image/jpeg',
      0.92,
    );
  }, [stopCamera]);

  const handleRetake = useCallback(() => {
    setSelfieFile(null);
    startCamera();
  }, [startCamera]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleSubmit = async () => {
    if (!idFront || !selfieFile) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        navigate('/login?redirect=/verify', { replace: true });
        return;
      }
      const formData = new FormData();
      formData.append('id_front', idFront);
      formData.append('selfie', selfieFile);
      if (idBack) formData.append('id_back', idBack);

      const res = await fetch(
        `${ELITE_API_URL}/api/user/verification/submit`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Verification submission failed');
      }
      const data = await res.json();

      if (data.status === 'approved') {
        setVerificationStatus('approved');
      } else {
        setVerificationStatus('under_review');
        if (data.submitted_at) setSubmittedAt(data.submitted_at);
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#FFCB32] animate-spin" />
      </div>
    );
  }

  if (verificationStatus === 'admin') {
    return (
      <div className="py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <AdminState />
        </div>
      </div>
    );
  }

  if (verificationStatus === 'approved') {
    return (
      <div className="py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <ApprovedState />
        </div>
      </div>
    );
  }

  if (verificationStatus === 'under_review') {
    return (
      <div className="py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <UnderReviewState submittedAt={submittedAt} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <ProgressBar current={step} />

          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 text-center">
                Verify Your Identity
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1 mb-6">
                Become a Verified Seller on Elite TCG
              </p>

              <div className="grid grid-cols-2 gap-3">
                {ID_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setIdType(type.value)}
                    className={`relative flex items-center justify-center text-sm font-medium rounded-xl p-4 transition-all ${
                      idType === type.value
                        ? 'border-2 border-[#FFCB32] bg-[#FFCB32]/5 text-gray-900'
                        : 'border border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {type.label}
                    {idType === type.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FFCB32] flex items-center justify-center">
                        <Check className="w-3 h-3 text-gray-900" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!idType}
                onClick={() => setStep(2)}
                className="w-full mt-6 bg-[#FFCB32] text-gray-900 font-medium rounded-full px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 text-center">
                Upload Your ID
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1 mb-6">
                {selectedIdType
                  ? `Upload your ${selectedIdType.label}`
                  : 'Upload your identification document'}
              </p>

              <div className="space-y-4">
                <UploadArea
                  label="Front of ID"
                  required
                  file={idFront}
                  onFileChange={setIdFront}
                  onClear={() => setIdFront(null)}
                />
                {showBack && (
                  <UploadArea
                    label="Back of ID (optional)"
                    required={false}
                    file={idBack}
                    onFileChange={setIdBack}
                    onClear={() => setIdBack(null)}
                  />
                )}
              </div>

              <button
                type="button"
                disabled={!idFront}
                onClick={() => setStep(3)}
                className="w-full mt-6 bg-[#FFCB32] text-gray-900 font-medium rounded-full px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 text-center">
                Take a Selfie
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1 mb-6">
                Look directly at the camera. Make sure your face is clearly
                visible.
              </p>

              {!selfieFile ? (
                <div>
                  {!cameraError ? (
                    <div className="relative w-full aspect-[3/4] max-w-[320px] mx-auto rounded-xl overflow-hidden bg-gray-900 mb-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[60%] h-[55%] border-2 border-[#FFCB32]/60 rounded-[50%]" />
                      </div>
                      {!cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                          <Loader2 className="w-8 h-8 text-[#FFCB32] animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] max-w-[320px] mx-auto rounded-xl bg-gray-100 flex flex-col items-center justify-center mb-4 p-6">
                      <Camera className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        Camera unavailable. Please upload a photo instead.
                      </p>
                    </div>
                  )}

                  {!cameraError && cameraActive && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full bg-gray-900 text-white font-medium rounded-full px-6 py-2.5 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Photo
                    </button>
                  )}

                  <div className="mt-4">
                    <label className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
                      <ImageUp className="w-4 h-4" />
                      Can&apos;t use camera? Upload a photo instead
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setSelfieFile(f);
                            stopCamera();
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-full max-w-[320px] mx-auto rounded-xl overflow-hidden mb-4">
                    <img
                      src={URL.createObjectURL(selfieFile)}
                      alt="Selfie preview"
                      className="w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="w-full border border-gray-300 text-gray-700 font-medium rounded-full px-6 py-2.5 hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    Retake
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              <button
                type="button"
                disabled={!selfieFile}
                onClick={() => setStep(4)}
                className="w-full mt-4 bg-[#FFCB32] text-gray-900 font-medium rounded-full px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 text-center">
                Review & Submit
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1 mb-6">
                We&apos;ll verify your identity automatically. This usually
                takes just a few seconds.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {idFront && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 text-center">
                      ID Front
                    </p>
                    <img
                      src={URL.createObjectURL(idFront)}
                      alt="ID Front"
                      className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                {idBack && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 text-center">
                      ID Back
                    </p>
                    <img
                      src={URL.createObjectURL(idBack)}
                      alt="ID Back"
                      className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                {selfieFile && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 text-center">
                      Selfie
                    </p>
                    <img
                      src={URL.createObjectURL(selfieFile)}
                      alt="Selfie"
                      className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full bg-[#FFCB32] text-gray-900 font-medium rounded-full px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying your identity...
                  </>
                ) : (
                  'Submit Verification'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
