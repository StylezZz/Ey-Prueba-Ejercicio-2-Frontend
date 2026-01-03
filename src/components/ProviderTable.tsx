import type { Provider } from "../types/provider";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Trash2, Shield, Pencil, Eye } from "lucide-react";

interface Props {
  providers: Provider[];
  onDelete: (provider: Provider) => void;
  onScreening: (id: number) => void;
  onEdit: (provider: Provider) => void;
  onView: (provider: Provider) => void;
}

export default function ProviderTable({
  providers,
  onDelete,
  onScreening,
  onEdit,
  onView,
}: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold w-16">#</TableHead>
            <TableHead className="font-semibold w-20">ID</TableHead>
            <TableHead className="font-semibold">Legal Name</TableHead>
            <TableHead className="font-semibold">Tax ID</TableHead>
            <TableHead className="font-semibold">Country</TableHead>
            <TableHead className="font-semibold text-right">Annual Revenue</TableHead>
            <TableHead className="font-semibold">Last Updated</TableHead>
            <TableHead className="text-right font-semibold min-w-[320px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No providers found.
              </TableCell>
            </TableRow>
          ) : (
            providers.map((p, index) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {p.id}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold">{p.legalName}</p>
                    {p.tradeName && (
                      <p className="text-xs text-muted-foreground">{p.tradeName}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {p.taxId}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{p.country || "-"}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {p.annualRevenue ? formatCurrency(p.annualRevenue) : "-"}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(p.lastUpdated)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(p)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(p)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onScreening(p.id!)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Screening
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}