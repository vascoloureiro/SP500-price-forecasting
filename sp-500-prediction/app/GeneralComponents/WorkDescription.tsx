import React, { Children } from 'react';
import { FileText, Github, Notebook } from 'lucide-react';

interface WorkDescriptionProps {
  children?: React.ReactNode;
  pdfUrl?: string;
  pdfLabel?: string;
}

const WorkDescription: React.FC<WorkDescriptionProps> = ({

  children,
  pdfUrl,
  pdfLabel = "Baixar Relatório",
}) => {
  return (
    <div className="bg-gray-50 p-10 flex flex-col gap-6  w-[100%]">
      <div className="flex flex-start">
        {children}
      </div>

      <div className='flex gap-4'>
        {pdfUrl && (
          <div className="mt-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2  px-4 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-600 transition shadow-md w-[320px]"
            >
              <FileText size={20} />
              {pdfLabel}
            </a>
          </div>
        )}

        <div className='mt-4'>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2  px-4 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-700 transition shadow-md w-[320px]"
          >
            <Github size={20} />
            Repositório GitHub
          </a>
        </div>

        <div className='mt-4'>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2  px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-800 transition shadow-md w-[320px]"
          >
            <Notebook size={20} />
            <p>Baixar NoteBook</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkDescription;
