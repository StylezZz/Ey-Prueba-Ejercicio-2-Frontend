import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProviderForm from "@/components/ProviderForm";
import ProviderTable from "@/components/ProviderTable";
import RiskModal from "@/components/RiskModal";
import useProviders from "@/hooks/useProviders";
import { Shield, Search, X } from "lucide-react";
import type { Provider } from "@/types/provider";
import { DialogFooter, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import ProviderDetailsModal from "@/components/ProviderDetailsModal";

export default function ProvidersPage() {
  const {
    providers,
    loading,
    addProvider,
    editProvider,
    removeProvider,
  } = useProviders();

  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewingProvider, setViewingProvider] = useState<Provider | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [screeningProvider, setScreeningProvider] = useState<Provider | null>(null);
  const [screeningModalOpen, setScreeningModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("");

  const uniqueCountries = Array.from(new Set(providers.map(p => p.country).filter(Boolean))).sort();

  const filteredProviders = providers.filter(p => {
    const matchSearch = p.legalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       p.taxId.includes(searchTerm) ||
                       (p.tradeName && p.tradeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCountry = !filterCountry || (p.country && p.country === filterCountry);
    return matchSearch && matchCountry;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);

  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCountryChange = (value: string) => {
    setFilterCountry(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCountry("");
    setCurrentPage(1);
  };

  const handleView = (provider: Provider) => {
    setViewingProvider(provider);
    setViewModalOpen(true);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setEditModalOpen(true);
  };

  const handleScreening = (id: number) => {
    const provider = providers.find(p => p.id === id);
    if (provider) {
      setScreeningProvider(provider);
      setScreeningModalOpen(true);
    }
  };

  const handleDeleteClick = (provider: Provider) => {
    setDeletingProvider(provider);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingProvider?.id) {
      setDeleting(true);
      try {
        await removeProvider(deletingProvider.id);
        setDeleteModalOpen(false);
        setDeletingProvider(null);
      } catch (error) {
        console.error("Error deleting provider: ", error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeletingProvider(null);
  };

  const handleEditSubmit = async (providerData: Omit<Provider, "id" | "lastUpdated">) => {
    if (editingProvider?.id) {
      await editProvider(editingProvider.id, providerData);
      setEditModalOpen(false);
      setEditingProvider(null);
    }
  };

  const handleEditModalClose = (open: boolean) => {
    setEditModalOpen(open);
    if (!open) {
      setEditingProvider(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-[95vw]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Provider Risk Management</CardTitle>
            </div>
            <ProviderForm onSubmit={addProvider} mode="create" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search" className="mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, trade name, or tax ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-64">
                <Label htmlFor="country" className="mb-2 block">Country</Label>
                <select
                  id="country"
                  value={filterCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              {(searchTerm || filterCountry) && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {paginatedProviders.length} of {filteredProviders.length} provider(s)
                {filteredProviders.length !== providers.length && ` (filtered from ${providers.length} total)`}
              </span>
            </div>
          </div>

          {loading ? (
            <Alert>
              <AlertDescription>Loading providers...</AlertDescription>
            </Alert>
          ) : filteredProviders.length === 0 ? (
            <Alert>
              <AlertDescription>
                No providers found. {(searchTerm || filterCountry) && "Try adjusting your filters."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <ProviderTable
                providers={paginatedProviders}
                onDelete={handleDeleteClick}
                onScreening={handleScreening}
                onEdit={handleEdit}
                onView={handleView}
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {editingProvider && (
        <ProviderForm
          onSubmit={handleEditSubmit}
          provider={editingProvider}
          open={editModalOpen}
          onOpenChange={handleEditModalClose}
          mode="edit"
        />
      )}

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this provider? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingProvider && (
            <div className="py-4 space-y-2">
              <p className="font-semibold">{deletingProvider.legalName}</p>
              <p className="text-sm text-muted-foreground">
                Tax ID: {deletingProvider.taxId}
              </p>
              {deletingProvider.country && (
                <p className="text-sm text-muted-foreground">
                  Country: {deletingProvider.country}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Provider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {screeningProvider && (
        <RiskModal
          provider={screeningProvider}
          open={screeningModalOpen}
          onClose={() => {
            setScreeningModalOpen(false);
            setScreeningProvider(null);
          }}
        />
      )}

      {viewingProvider && (
        <ProviderDetailsModal
          provider={viewingProvider}
          open={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setViewingProvider(null);
          }}
        />
      )}
    </div>
  );
}