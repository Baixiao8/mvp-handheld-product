import { useRef, useCallback, useEffect } from 'react';
import { CloudUploadOutlined, CloseOutlined } from '@ant-design/icons';
import { Spin, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { uploadProductImage } from '@/api/handheld';
import { useHandheldStore } from '@/store';
import { track } from '@/tracking';
import { UPLOAD_CONSTRAINTS, ErrorCode } from '@/types';
import { HandheldApiError } from '@/api/client';

/**
 * 上传商品图组件
 * 支持:点击 / 拖拽 / 粘贴(Ctrl/Cmd+V)
 * 校验:size ≤10MB · format JPG/PNG/WEBP
 */
export default function ProductUpload() {
  const { productImageUrl, setProductImage } = useHandheldStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);
  const uploadStartRef = useRef(0);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProductImage(file),
    onMutate: (file) => {
      uploadStartRef.current = Date.now();
      track.uploadStart({ fileSize: file.size, fileType: file.type });
    },
    onSuccess: (data, file) => {
      setProductImage(data.url, file);
      track.uploadSuccess({
        fileSize: file.size,
        durationMs: Date.now() - uploadStartRef.current,
      });
    },
    onError: (err: HandheldApiError) => {
      track.uploadFail({
        errorCode: err.code,
        errorMessage: err.message,
      });
      message.error(err.userMessage || '上传失败');
    },
  });

  const validateFile = (file: File): string | null => {
    if (file.size > UPLOAD_CONSTRAINTS.maxSizeMB * 1024 * 1024) {
      return `文件超过 ${UPLOAD_CONSTRAINTS.maxSizeMB}MB,请压缩后重试`;
    }
    if (!(UPLOAD_CONSTRAINTS.acceptedFormats as readonly string[]).includes(file.type)) {
      return '不支持的格式,请上传 JPG / PNG / WEBP';
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        track.uploadFail({ errorCode: ErrorCode.UNSUPPORTED_FORMAT, errorMessage: error });
        message.error(error);
        return;
      }
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current = 0;
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current++;
    e.currentTarget.classList.add('dragover');
  };
  const handleDragLeave = (e: React.DragEvent) => {
    dragCountRef.current--;
    if (dragCountRef.current <= 0) e.currentTarget.classList.remove('dragover');
  };

  // 粘贴上传
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProductImage(null, null);
  };

  return (
    <div className="form-section">
      <label className="section-label">
        <span className="required">*</span>商品图
      </label>
      <div
        className="upload-area"
        onClick={!productImageUrl && !uploadMutation.isPending ? handleClick : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {uploadMutation.isPending ? (
          <Spin size="large" />
        ) : productImageUrl ? (
          <div className="upload-preview">
            <img src={productImageUrl} alt="商品预览" />
            <button className="upload-remove" onClick={handleRemove} title="移除">
              <CloseOutlined />
            </button>
          </div>
        ) : (
          <div className="upload-empty">
            <CloudUploadOutlined className="upload-icon" />
            <div className="upload-hint">点击 / 拖拽 / 粘贴上传图片</div>
            <div className="upload-meta">JPG / PNG / WEBP · ≤10MB · 长边 512-2048px</div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
