import React from 'react';

// --- SVG Icons ---
const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
// --- End SVG Icons ---


interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColor = 'bg-red-600 hover:bg-red-700 focus:ring-red-500', // Default to destructive action color
}) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900 bg-opacity-75 transition-opacity duration-300 ease-in-out"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
    >
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100">
        <div className="flex items-start justify-between p-5 border-b border-slate-200 rounded-t-xl">
          <div className="flex items-center">
            <div className={`mr-3 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${confirmButtonColor.includes('red') ? 'bg-red-100' : 'bg-sky-100'} sm:h-8 sm:w-8`}>
                <ExclamationTriangleIcon className={`h-6 w-6 ${confirmButtonColor.includes('red') ? 'text-red-600' : 'text-sky-600'}`} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800" id="modal-title">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {typeof message === 'string' ? (
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          ) : (
            message
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent px-5 py-2.5 text-base font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${confirmButtonColor}`}
          >
            {confirmButtonText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-150"
          >
            {cancelButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
