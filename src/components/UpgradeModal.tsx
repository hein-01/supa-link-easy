import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
}

export default function UpgradeModal({ isOpen, onClose, businessId, businessName }: UpgradeModalProps) {
  const [totalAmount, setTotalAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiptFile || !totalAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload a receipt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload receipt to Supabase storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${businessId}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(`receipts/${fileName}`, receiptFile);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('business-assets')
        .getPublicUrl(`receipts/${fileName}`);

      // Update business with new receipt URL and payment status
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          receipt_url: urlData.publicUrl,
          payment_status: 'to_be_confirmed',
          last_payment_date: new Date().toISOString()
        })
        .eq('id', businessId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Receipt uploaded successfully. Your upgrade request has been submitted for admin confirmation.",
      });

      setTotalAmount("");
      setReceiptFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade Business Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Business Name</Label>
            <div className="mt-1 p-3 bg-muted rounded-md">
              <p className="text-sm">{businessName}</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="totalAmount" className="text-sm font-medium">
              Total Amount ($)
            </Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              placeholder="Enter total amount"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="receipt" className="text-sm font-medium">
              Upload Receipt
            </Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1"
              required
            />
            {receiptFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {receiptFile.name}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Submit Upgrade Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}