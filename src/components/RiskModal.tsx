/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, CheckCircle, Loader2, Shield, X } from "lucide-react";
import type { Provider } from "@/types/provider";
import type { RiskResponse } from "@/types/risk";
import { runRiskAll, runRiskMultipleSources } from "@/api/providers.api";

interface Props {
  provider: Provider;
  onClose: () => void;
  open: boolean;
}

const AVAILABLE_SOURCES = [
  { id: "all", name: "All Sources (Automatic)", apiValue: "all" },
  { id: "ofac", name: "OFA", apiValue: "ofac" },
  { id: "offshore-leaks", name: "Offshore Leaks", apiValue: "offshore-leaks" },
  { id: "world-bank", name: "The World Bank", apiValue: "world-bank" },
];

const SOURCE_COLUMNS: Record<string, Array<{ key: string; label: string }>> = {
  "world-bank": [
    { key: "firm_name", label: "Firm Name" },
    { key: "address", label: "Address" },
    { key: "country", label: "Country" },
    { key: "from_date", label: "From Date" },
    { key: "to_date", label: "To Date" },
    { key: "grounds", label: "Grounds" },
  ],
  "offshore-leaks": [
    { key: "entity_name", label: "Entity" },
    { key: "entity_url", label: "Entity URL" },
    { key: "jurisdiction", label: "Jurisdiction" },
    { key: "linked_to", label: "Linked To" },
    { key: "data_from", label: "Data From" },
  ],
  "ofac": [
    { key: "name", label: "Name" },
    { key: "name_url", label: "Name URL" },
    { key: "address", label: "Address" },
    { key: "type", label: "Type" },
    { key: "programs", label: "Program(s)" },
    { key: "list", label: "List" },
    { key: "score", label: "Score" },
  ],
};

const SOURCE_NAME_MAP: Record<string, string> = {
  "OFAC": "ofac",
  "Offshore Leaks": "offshore-leaks",
  "offshore leaks": "offshore-leaks",
  "The World Bank": "world-bank",
  "the world bank": "world-bank",
};

const normalizeSourceName = (source: string): string => {
  if (SOURCE_NAME_MAP[source]) {
    return SOURCE_NAME_MAP[source];
  }
  
  const lowerSource = source.toLowerCase();
  if (SOURCE_NAME_MAP[lowerSource]) {
    return SOURCE_NAME_MAP[lowerSource];
  }
  
  if (lowerSource.includes('offshore')) {
    return 'offshore-leaks';
  }
  
  if (lowerSource.includes('world') || lowerSource.includes('bank')) {
    return 'world-bank';
  }
  
  if (lowerSource.includes('ofac')) {
    return 'ofac';
  }
  
  return source.toLowerCase().replace(/\s+/g, '-').trim();
};

export default function RiskModal({ provider, onClose, open }: Props) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (open) {
      setSelectedSources([]);
      setResult(null);
      setError(null);
      setLoading(false);
      setCurrentPage(1);
    }
  }, [open]);

  useEffect(() => {
    if (selectedSources.length > 0 && open) {
      handleScreening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSources]);

  useEffect(() => {
    setCurrentPage(1);
  }, [result]);

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources((prev) => {
      if (sourceId === "all") {
        if (prev.includes("all")) {
          return [];
        }
        return ["all"];
      }

      const newSelection = prev.filter(id => id !== "all");
      
      if (newSelection.includes(sourceId)) {
        return newSelection.filter((id) => id !== sourceId);
      } else {
        if (newSelection.length >= 3) {
          return newSelection;
        }
        return [...newSelection, sourceId];
      }
    });
  };

  const handleScreening = async () => {
    if (!provider.id || selectedSources.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      
      if (selectedSources.includes("all")) {
        response = await runRiskAll(provider.id);
        console.log("Response ALL:", response.data);
        
        if (response.data && !response.data.entity_name) {
          response.data.entity_name = provider.legalName;
        }
        setResult(response.data);
      } else {
        const apiValues = selectedSources.map(
          sourceId => AVAILABLE_SOURCES.find(s => s.id === sourceId)?.apiValue || sourceId
        );
        console.log("Calling with sources:", apiValues);
        const combinedResult = await runRiskMultipleSources(provider.id, apiValues);
        console.log("Combined result:", combinedResult);
        
        combinedResult.entity_name = provider.legalName;
        setResult(combinedResult);
      }
    } catch (err) {
      console.error("Error running screening:", err);
      setError("Failed to run screening. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const matchesBySource = result?.sources && Array.isArray(result.sources)
    ? result.sources
        .filter(s => s.hits > 0)
        .map(s => ({
          source: s.source,
          sourceName: AVAILABLE_SOURCES.find(
            src => src.apiValue === s.source || src.id === s.source
          )?.name || s.source,
          results: Array.isArray(s.results) ? s.results : [],
          totalHits: s.hits
        }))
    : [];

  const getValue = (obj: any, key: string): string => {
    if (!obj) return '-';
    
    if (obj[key] !== undefined && obj[key] !== null) {
      const value = obj[key];
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    }

    return '-';
  };

  const isRisk = result && result.total_hits > 0;
  const isAllSelected = selectedSources.includes("all");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 pointer-events-none">
        <div 
          className="w-screen h-screen bg-white shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 bg-gray-50 border-b px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <Shield className="h-7 w-7" />
                  Risk Screening
                </div>
                <p className="text-base text-gray-600 mt-1">{provider.legalName}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 flex-shrink-0 bg-white border-r overflow-y-auto">
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Select Sources</h3>
                <p className="text-xs text-gray-600">Choose 1-3 sources to screen</p>
              </div>
              
              <div className="space-y-3">
                {AVAILABLE_SOURCES.map((source) => {
                  const isSelected = selectedSources.includes(source.id);
                  const isDisabled = 
                    (isAllSelected && source.id !== "all") ||
                    (!isSelected && !isAllSelected && source.id !== "all" && selectedSources.length >= 3);
                  
                  return (
                    <div
                      key={source.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-gray-100 border-gray-400" 
                          : "border-gray-200 hover:border-gray-300"
                      } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      onClick={() => !isDisabled && handleSourceToggle(source.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={source.id}
                          checked={isSelected}
                          disabled={isDisabled}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={source.id}
                            className={`font-semibold text-sm leading-tight block ${
                              isDisabled ? "" : "cursor-pointer"
                            }`}
                          >
                            {source.name}
                          </Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="pt-4 border-t border-gray-300">
                <div className="text-xs text-gray-600">
                  <strong>Selected:</strong> {selectedSources.length}/3
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-8 space-y-8">

            {loading && (
              <Alert>
                <Loader2 className="h-5 w-5 animate-spin" />
                <AlertTitle>Screening in progress...</AlertTitle>
                <AlertDescription>
                  Checking against {isAllSelected ? "all" : selectedSources.length} source(s)
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && !loading && (
              <>
                <div className="space-y-6">
                  <Alert variant={isRisk ? "destructive" : "default"}>
                    <AlertTitle className="flex items-center gap-2">
                      {isRisk ? (
                        <>
                          <AlertCircle className="h-5 w-5" />
                          Risk Detected
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          No Risk Found
                        </>
                      )}
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      Total hits: <strong>{result.total_hits}</strong>
                      {result.entity_name && ` for ${result.entity_name}`}
                    </AlertDescription>
                  </Alert>

                  {result.sources && Array.isArray(result.sources) && result.sources.length > 0 && (
                    <div className="rounded-lg p-6 border">
                      <h3 className="text-lg font-bold mb-4">
                        Summary by Source
                      </h3>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold">Source</TableHead>
                              <TableHead className="text-center font-semibold">Hits</TableHead>
                              <TableHead className="text-right font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.sources.map((s, index) => (
                              <TableRow key={`${s.source}-${index}`}>
                                <TableCell className="font-medium">
                                  {
                                    AVAILABLE_SOURCES.find(
                                      (src) => src.apiValue === s.source || src.id === s.source
                                    )?.name || s.source
                                  }
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={s.hits > 0 ? "destructive" : "secondary"}>
                                    {s.hits}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {s.hits > 0 ? (
                                    <Badge variant="destructive">MATCH</Badge>
                                  ) : (
                                    <Badge variant="outline">CLEAR</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {matchesBySource.length > 0 ? (
                    matchesBySource.map((sourceData) => {
                      const normalizedSource = normalizeSourceName(sourceData.source);
                      
                      console.log("Source from backend:", sourceData.source);
                      console.log("Normalized source:", normalizedSource);
                      console.log("Sample data:", sourceData.results[0]);
                      
                      const columns = SOURCE_COLUMNS[normalizedSource];
                      
                      console.log("Columns found:", columns);
                      console.log("Column keys:", columns?.map(c => c.key));
                      
                      const totalPages = Math.ceil(sourceData.results.length / itemsPerPage);
                      const paginatedResults = sourceData.results.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      );

                      return (
                        <div key={sourceData.source} className="pb-8">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                              <h3 className="text-lg font-bold">
                                {sourceData.sourceName}
                              </h3>
                              <Badge variant="destructive">
                                {sourceData.totalHits} match(es)
                              </Badge>
                            </div>
                            
                            <div className="relative">
                              <div className="rounded-lg border overflow-hidden">
                                <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px' }}>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20 font-semibold text-center sticky left-0 bg-gray-50 z-20 border-r">
                                          #
                                        </TableHead>
                                        {columns && columns.length > 0 ? (
                                          columns.map((col, idx) => (
                                            <TableHead key={col.key} className={`min-w-[250px] font-semibold whitespace-nowrap px-6 ${idx === columns.length - 1 ? '' : 'border-r'}`}>
                                              {col.label}
                                            </TableHead>
                                          ))
                                        ) : (
                                          <TableHead className="font-semibold">Data</TableHead>
                                        )}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {paginatedResults.map((match, index) => (
                                        <TableRow key={`${sourceData.source}-${index}`}>
                                          <TableCell className="text-muted-foreground text-center sticky left-0 bg-white z-10 border-r">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                          </TableCell>
                                          {columns && columns.length > 0 ? (
                                            columns.map((col, idx) => (
                                              <TableCell key={col.key} className={`px-6 ${idx === columns.length - 1 ? '' : 'border-r'}`}>
                                                <div className="py-2" title={getValue(match, col.key)}>
                                                  {getValue(match, col.key)}
                                                </div>
                                              </TableCell>
                                            ))
                                          ) : (
                                            <TableCell>
                                              <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                                                {JSON.stringify(match, null, 2)}
                                              </pre>
                                            </TableCell>
                                          )}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>

                            {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-4 pb-2 bg-background">
                                <div className="text-sm text-muted-foreground">
                                  Page {currentPage} of {totalPages} ({sourceData.totalHits} total)
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
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <Alert>
                      <AlertDescription>No matches found in any source.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        </div>
        </div>
      </div>
    </>
  );
}