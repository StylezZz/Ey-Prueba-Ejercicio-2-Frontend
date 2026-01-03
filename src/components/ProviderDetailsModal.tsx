import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import type { Provider } from "@/types/provider";
import { Building2, Phone, Mail, Globe, MapPin, DollarSign, Calendar } from "lucide-react";

interface Props {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
}

export default function ProviderDetailsModal({ provider, open, onClose }: Props) {
  if (!provider) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Provider Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="font-mono text-xs">
                  ID: {provider.id}
                </Badge>
              </div>
              <h3 className="text-xl font-bold">{provider.legalName}</h3>
              {provider.tradeName && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {provider.tradeName}
                </p>
              )}
            </div>
            <div className="text-right">
              <Label className="text-xs text-muted-foreground">Tax ID</Label>
              <p className="font-mono text-sm font-semibold">{provider.taxId}</p>
            </div>
          </div>

          <Separator className="my-1" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Contact Information</h4>
              
              <div className="space-y-2">
                {provider.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{provider.phone}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 opacity-50">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">No phone</span>
                  </div>
                )}

                {provider.email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <a 
                      href={`mailto:${provider.email}`} 
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {provider.email}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 opacity-50">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">No email</span>
                  </div>
                )}

                {provider.website ? (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <a 
                      href={provider.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {provider.website}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 opacity-50">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">No website</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Location</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {provider.country ? (
                      <Badge variant="outline" className="text-xs">
                        {provider.country}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not specified</span>
                    )}
                  </div>
                  {provider.addresss && (
                    <p className="text-sm text-muted-foreground pl-5">{provider.addresss}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Financial</h4>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    {provider.annualRevenue && provider.annualRevenue > 0 
                      ? formatCurrency(provider.annualRevenue)
                      : "Not specified"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-1" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: {formatDate(provider.lastUpdated)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}