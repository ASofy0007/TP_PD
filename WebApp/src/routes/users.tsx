import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { UsersAPI, getHistoryMovie, type User } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageHeader } from "@/components/PageHeader";
import { ChevronsUpDown, Check, RefreshCw, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export default function UsersPage() {
  const users = useQuery({ queryKey: ["users"], queryFn: UsersAPI.list });
  const [selected, setSelected] = useState<User | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showS3Users, setShowS3Users] = useState(false);

  const history = useQuery({
    queryKey: ["history", selected?._id],
    queryFn: () => UsersAPI.history(selected!._id),
    enabled: !!selected,
  });

  // Query para buscar lista de utilizadores do S3
  const s3Users = useQuery({
    queryKey: ["s3-users"],
    queryFn: () => fetch("/api/files/users").then((r) => r.json()),
    enabled: false, // só corre quando chamarmos manualmente
  });

  const { user } = useAuth();

  const list = useMemo(() => {
    return (users.data ?? []).filter((u) => u._id !== user?._id);
  }, [users.data, user]);

  const handleS3Refresh = () => {
    setShowS3Users(true);
    s3Users.refetch();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        title="Users"
        subtitle="Browse other users and view their watch history"
      />

      <Card>
        <CardContent className="p-6 space-y-4">

          {/* Botão S3 */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleS3Refresh}
              disabled={s3Users.isFetching}
              className="flex items-center gap-2"
            >
              {s3Users.isFetching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              {s3Users.isFetching ? "A carregar do S3..." : "Refresh from S3"}
            </Button>

            {showS3Users && s3Users.data && (
              <span className="text-sm text-muted-foreground">
                {s3Users.data.length} utilizador(es) carregados do S3
              </span>
            )}
            {s3Users.isError && (
              <span className="text-sm text-destructive">
                Erro ao carregar do S3.
              </span>
            )}
          </div>

          {/* Tabela com utilizadores do S3 */}
          {showS3Users && s3Users.data && s3Users.data.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Utilizadores (S3)
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s3Users.data.map((u: User) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {showS3Users && s3Users.data && s3Users.data.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum utilizador no S3 ainda.</p>
          )}

          {/* Picker de utilizadores (comportamento original) */}
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

          {/* Histórico do utilizador selecionado (comportamento original) */}
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
    </div>
  );
}
