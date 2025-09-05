import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateWithOrdinal } from "@/lib/dateUtils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  onSuccess?: () => void;
}

export default function UpgradeModal({ isOpen, onClose, businessId, businessName, onSuccess }: UpgradeModalProps) {
  const [totalAmount, setTotalAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [odooExpiredDate, setOdooExpiredDate] = useState<string>("");
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
      // First, get the current business data to check listing_expired_date
      const { data: currentBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('listing_expired_date')
        .eq('id', businessId)
        .single();

      if (fetchError) throw fetchError;

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

      // Calculate odoo_expired_date as today + 30 days
      const odooExpiredDate = new Date();
      odooExpiredDate.setDate(odooExpiredDate.getDate() + 30);

      // Check if listing_expired_date needs to be updated (if it's in the past)
      const currentDate = new Date();
      const updateData: any = {
        receipt_url: urlData.publicUrl,
        payment_status: 'to_be_confirmed',
        last_payment_date: new Date().toISOString(),
        odoo_expired_date: odooExpiredDate.toISOString(),
        'POS+Website': 1
      };

      // If listing_expired_date is in the past, update it to today + 365 days
      if (currentBusiness.listing_expired_date && new Date(currentBusiness.listing_expired_date) < currentDate) {
        const newListingExpiredDate = new Date();
        newListingExpiredDate.setDate(newListingExpiredDate.getDate() + 365);
        updateData.listing_expired_date = newListingExpiredDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      // Update business with new receipt URL, payment status, POS+Website option, and dates
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId);

      if (updateError) throw updateError;

      // Fetch the updated business to get the new odoo_expired_date
      const { data: updatedBusiness, error: updateFetchError } = await supabase
        .from('businesses')
        .select('odoo_expired_date')
        .eq('id', businessId)
        .single();

      if (updateFetchError) throw updateFetchError;

      toast({
        title: "Success",
        description: "Receipt uploaded successfully. Your upgrade request has been submitted for admin confirmation.",
      });

      // Close the modal and refresh the page after successful submission
      onClose();
      onSuccess?.();
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
{submitted ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Business Name</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <p className="text-sm">{businessName}</p>
              </div>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Upgrade Request Submitted Successfully!</AlertTitle>
              <AlertDescription>
                Your upgrade request has been submitted for admin confirmation.
              </AlertDescription>
            </Alert>

            {odooExpiredDate && (
              <div>
                <Label className="text-sm font-medium">POS+Website Access Valid Until</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-semibold text-primary">
                    {formatDateWithOrdinal(odooExpiredDate)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}