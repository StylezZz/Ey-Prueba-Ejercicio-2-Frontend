/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, AlertCircle } from "lucide-react";
import type { Provider } from "@/types/provider";
import { Alert, AlertDescription } from "./ui/alert";

interface Props {
  onSubmit: (provider: Omit<Provider, "id" | "lastUpdated">) => Promise<void>;
  provider?: Provider | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "create" | "edit";
}

interface FormErrors {
  legalName?: string;
  taxId?: string;
  email?: string;
  website?: string;
  phone?: string;
  annualRevenue?: string;
  country?: string;
}

export default function ProviderForm({ 
  onSubmit, 
  provider = null,
  open: controlledOpen,
  onOpenChange,
  mode = "create"
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [formData, setFormData] = useState({
    legalName: "",
    tradeName: "",
    taxId: "",
    phone: "",
    email: "",
    website: "",
    addresss: "",
    country: "",
    annualRevenue: "",
  });

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (provider && open) {
      setFormData({
        legalName: provider.legalName || "",
        tradeName: provider.tradeName || "",
        taxId: provider.taxId || "",
        phone: provider.phone || "",
        email: provider.email || "",
        website: provider.website || "",
        addresss: provider.addresss || "",
        country: provider.country || "",
        annualRevenue: provider.annualRevenue ? provider.annualRevenue.toString() : "",
      });
      setErrors({});
      setSubmitError("");
    } else if (!open) {
      setFormData({
        legalName: "",
        tradeName: "",
        taxId: "",
        phone: "",
        email: "",
        website: "",
        addresss: "",
        country: "",
        annualRevenue: "",
      });
      setErrors({});
      setSubmitError("");
    }
  }, [provider, open]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "legalName":
        if (!value.trim()) return "Legal name is required";
        if (value.length < 3) return "Legal name must be at least 3 characters";
        return undefined;

      case "taxId":
        if (!value.trim()) return "Tax ID is required";
        if (!/^\d+$/.test(value)) return "Tax ID must contain only digits";
        if(value.length !== 11) return "Tax ID must be exactly 11 digits";
        return undefined;

      case "email":
        if(!value.trim()) return "Email is required";
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        return undefined;
      case "country":
        if (!value.trim()) return "Country is required";
        return undefined;
      
      case "website":
        if (value && !/^https?:\/\/.+/.test(value)) {
          return "Website must start with http:// or https://";
        }
        return undefined;

      case "phone":
        if (value && !/^\+?[0-9\s\-()]{7,15}$/.test(value)) {
          return "Please enter a valid phone number";
        }
        return undefined;

      case "annualRevenue":
        if (value && isNaN(parseFloat(value))) {
          return "Please enter a valid number";
        }
        if (value && parseFloat(value) < 0) {
          return "Annual revenue cannot be negative";
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Borrar al iniciar escritura
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.legalName = validateField("legalName", formData.legalName);
    newErrors.taxId = validateField("taxId", formData.taxId);
    newErrors.email = validateField("email", formData.email);
    newErrors.country = validateField("country", formData.country);

    if (formData.website) newErrors.website = validateField("website", formData.website);
    if (formData.phone) newErrors.phone = validateField("phone", formData.phone);
    if (formData.annualRevenue) newErrors.annualRevenue = validateField("annualRevenue", formData.annualRevenue);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      setSubmitError("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        annualRevenue: parseFloat(formData.annualRevenue) || 0,
      });
      setFormData({
        legalName: "",
        tradeName: "",
        taxId: "",
        phone: "",
        email: "",
        website: "",
        addresss: "",
        country: "",
        annualRevenue: "",
      });
      setErrors({});
      setOpen(false);
    } catch (error: any) {
      console.error(`Error ${mode === "edit" ? "updating" : "creating"} provider:`, error);
      setSubmitError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Provider" : "Add New Provider"}
          </DialogTitle>
          <DialogDescription>
            Fill in the provider information. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="legalName">
                Legal Name (Razón Social) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="legalName"
                name="legalName"
                placeholder="Enter legal name"
                value={formData.legalName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.legalName ? "border-red-500" : ""}
              />
              {errors.legalName && (
                <p className="text-sm text-red-500">{errors.legalName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tradeName">Trade Name (Nombre Comercial)</Label>
              <Input
                id="tradeName"
                name="tradeName"
                placeholder="Enter trade name"
                value={formData.tradeName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="taxId">
                Tax ID (RUC) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="taxId"
                name="taxId"
                type="text"
                placeholder="11 digits"
                value={formData.taxId}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={11}
                inputMode="numeric"
                className={errors.taxId ? "border-red-500" : ""}

              />
              {errors.taxId && (
                <p className="text-sm text-red-500">{errors.taxId}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>  {/* Agregar asterisco */}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="addresss">Address (Dirección Física)</Label>
            <Input
              id="addresss"
              name="addresss"
              placeholder="Enter full address"
              value={formData.addresss}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>  {/* Agregar asterisco */}
              </Label>
              <Input
                id="country"
                name="country"
                placeholder="e.g., Peru, USA"
                value={formData.country}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="annualRevenue">Annual Revenue (Facturación Anual)</Label>
              <Input
                id="annualRevenue"
                name="annualRevenue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.annualRevenue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.annualRevenue ? "border-red-500" : ""}
              />
              {errors.annualRevenue && (
                <p className="text-sm text-red-500">{errors.annualRevenue}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading 
              ? (mode === "edit" ? "Updating..." : "Creating...") 
              : (mode === "edit" ? "Update Provider" : "Create Provider")
            }
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  if (mode === "create") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {dialogContent}
    </Dialog>
  );
}