import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { UsersAPI, HistoryAPI, getHistoryMovie, type HistoryEntry } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/PageHeader";
import { Pencil, Trash2, History as HistoryIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function HistoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const history = useQuery({
    queryKey: ["history", user?._id],
    queryFn: () => UsersAPI.history(user!._id),
    enabled: !!user,
  });
  const [editing, setEditing] = useState<HistoryEntry | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["history"] });
    qc.invalidateQueries({ queryKey: ["unwatched"] });
  };

  const updateM = useMutation({
    mutationFn: ({ id, watchedAt }: { id: string; watchedAt: string }) =>
      HistoryAPI.update(id, { watchedAt }),
    onSuccess: () => { invalidate(); setEditing(null); toast.success("Date updated"); },
    onError: () => toast.error("Failed to update"),
  });
  const deleteM = useMutation({
    mutationFn: HistoryAPI.remove,
    onSuccess: () => { invalidate(); toast.success("Removed from history"); },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader title="My History" subtitle="Movies you've watched" />

      <Card>
        <CardContent className="p-0">
          {history.isLoading && <p className="p-6 text-muted-foreground">Loading…</p>}
          {history.isError && <p className="p-6 text-destructive text-sm">Failed to load history.</p>}
          {history.data && history.data.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <HistoryIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              No watched movies yet.
            </div>
          )}
          {history.data && history.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movie</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Watched On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.data.map((e) => {
                  const m = getHistoryMovie(e);
                  return (
                    <TableRow key={e._id}>
                      <TableCell className="font-medium">{m?.title ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{m?.genre ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.watchedAt ? format(new Date(e.watchedAt), "PPP") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => setEditing(e)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteM.mutate(e._id)}
                          disabled={deleteM.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditDialog
        entry={editing}
        onClose={() => setEditing(null)}
        onSave={(date) => editing && updateM.mutate({ id: editing._id, watchedAt: date.toISOString() })}
        loading={updateM.isPending}
      />
    </div>
  );
}

function EditDialog({
  entry, onClose, onSave, loading,
}: { entry: HistoryEntry | null; onClose: () => void; onSave: (d: Date) => void; loading: boolean }) {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Dialog
      open={!!entry}
      onOpenChange={(o) => {
        if (!o) onClose();
        else if (entry?.watchedAt) setDate(new Date(entry.watchedAt));
      }}
    >
      <DialogContent>
        <DialogHeader><DialogTitle>Edit watched date</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <DialogFooter>
            <Button onClick={() => date && onSave(date)} disabled={!date || loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}