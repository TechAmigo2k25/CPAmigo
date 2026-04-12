import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Maximize2, ExternalLink, Loader2 } from "lucide-react";
import { getSafePdfUrl } from "./service";

interface PdfPreviewProps {
  pdfUrl: string;
  problemTitle: string;
}

export const ProblemPdfPreview = ({ pdfUrl, problemTitle }: PdfPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const safeUrl = getSafePdfUrl(pdfUrl);

  return (
    <Dialog>
      {/* The Button the Student sees */}
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200">
          <FileText className="w-4 h-4" />
          View Problem PDF
        </Button>
      </DialogTrigger>

      {/* The Modal Content */}
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            {problemTitle} - Statement
          </DialogTitle>
          <div className="flex items-center gap-2 mr-6">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open(safeUrl, "_blank")}
                className="text-xs h-8"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open in New Tab
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-muted relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading PDF...</span>
            </div>
          )}
          
          <iframe
            src={`${safeUrl}#toolbar=0`} // #toolbar=0 hides the internal browser UI for a cleaner look
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
            title="Problem Statement"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};