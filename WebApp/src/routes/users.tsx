import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { UsersAPI, getHistoryMovie, type User } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageHeader } from "@/components/PageHeader";
import { Plus, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["users"], queryFn: UsersAPI.list });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const history = useQuery({
    queryKey: ["history", selected?._id],
    queryFn: () => UsersAPI.history(selected!._id),
    enabled: !!selected,
  });

  const createU = useMutation({
    mutationFn: UsersAPI.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false); setName(""); setEmail("");
      toast.success("User created");
    },
    onError: () => toast.error("Failed to create user"),
  });

  const list = useMemo(() => users.data ?? [], [users.data]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        title="Users"
        subtitle="Search users and view their watch history"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); createU.mutate({ name, email }); }}
                className="space-y-4"
              >
                <div className="space-y-2"><Label>Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <DialogFooter>
                  <Button type="submit" disabled={createU.isPending}>{createU.isPending ? "Saving…" : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2 max-w-md">
            <Label>Search a user</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selected ? `${selected.name} — ${selected.email}` : "Select user…"}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by name or email…" />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {list.map((u) => (
                        <CommandItem
                          key={u._id}
                          value={`${u.name} ${u.email}`}
                          onSelect={() => { setSelected(u); setPickerOpen(false); }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selected?._id === u._id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span>{u.name}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selected && (
            <div className="space-y-2">
              <h3 className="font-semibold">Watch history — {selected.name}</h3>
              {history.isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
              {history.isError && <p className="text-destructive text-sm">Failed to load.</p>}
              {history.data && history.data.length === 0 && (
                <p className="text-muted-foreground text-sm">No watched movies yet.</p>
              )}
              {history.data && history.data.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Movie</TableHead>
                      <TableHead className="text-right">Watched On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.data.map((e) => {
                      const m = getHistoryMovie(e);
                      return (
                        <TableRow key={e._id}>
                          <TableCell className="font-medium">{m?.title ?? e.title ?? "—"}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {e.watchedAt ? new Date(e.watchedAt).toLocaleString() : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {users.isLoading && <p className="p-6 text-muted-foreground">Loading…</p>}
          {users.isError && <p className="p-6 text-destructive text-sm">Failed to load users.</p>}
          {list.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(u)}>View history</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
