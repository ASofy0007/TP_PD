import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MoviesAPI, HistoryAPI, UsersAPI, type Movie, getHistoryMovieId } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, Check, Film } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/movies")({
  component: MoviesPage,
});

type Filter = "all" | "watched" | "unwatched";

function MoviesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const movies = useQuery({ queryKey: ["movies"], queryFn: MoviesAPI.list });
  const history = useQuery({
    queryKey: ["history", user?._id],
    queryFn: () => UsersAPI.history(user!._id),
    enabled: !!user,
  });
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const watchedIds = useMemo(() => {
    const s = new Set<string>();
    history.data?.forEach((e) => s.add(getHistoryMovieId(e)));
    return s;
  }, [history.data]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["movies"] });
    qc.invalidateQueries({ queryKey: ["history"] });
    qc.invalidateQueries({ queryKey: ["unwatched"] });
  };

  const createM = useMutation({
    mutationFn: MoviesAPI.create,
    onSuccess: () => { invalidate(); setOpen(false); toast.success("Movie added"); },
    onError: () => toast.error("Failed to add movie"),
  });
  const deleteM = useMutation({
    mutationFn: MoviesAPI.remove,
    onSuccess: () => { invalidate(); toast.success("Movie deleted"); },
    onError: () => toast.error("Failed to delete"),
  });
  const watchM = useMutation({
    mutationFn: (movieId: string) =>
      HistoryAPI.watch({ userId: user!._id, movieId }),
    onSuccess: () => { invalidate(); toast.success("Marked as watched"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Already watched or failed"),
  });

  const visible = (movies.data ?? []).filter((m) => {
    if (filter === "watched") return watchedIds.has(m._id);
    if (filter === "unwatched") return !watchedIds.has(m._id);
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        title="Movies"
        subtitle="Browse and track your watch list"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Add Movie</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a new movie</DialogTitle></DialogHeader>
              <MovieForm
                onSubmit={(data) => createM.mutate(data)}
                loading={createM.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="watched">Watched</TabsTrigger>
          <TabsTrigger value="unwatched">Not Watched</TabsTrigger>
        </TabsList>
      </Tabs>

      {movies.isLoading && <p className="text-muted-foreground">Loading movies…</p>}
      {movies.isError && <p className="text-destructive text-sm">Failed to load movies.</p>}
      {movies.data && visible.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Film className="h-10 w-10 mx-auto mb-2 opacity-50" />
          No movies to show.
        </CardContent></Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => {
          const isWatched = watchedIds.has(m._id);
          return (
            <Card key={m._id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="leading-tight">{m.title}</CardTitle>
                  <Badge variant={isWatched ? "default" : "secondary"}>
                    {isWatched ? "Watched" : "Not Watched"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-1 text-sm text-muted-foreground">
                <div>{m.genre} • {m.releaseYear}</div>
              </CardContent>
              <CardFooter className="gap-2">
                {!isWatched && (
                  <Button size="sm" variant="outline" onClick={() => watchM.mutate(m._id)} disabled={watchM.isPending || !user}>
                    <Check className="h-4 w-4 mr-1" /> Mark as Watched
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="ml-auto text-destructive hover:text-destructive" onClick={() => deleteM.mutate(m._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MovieForm({ onSubmit, loading }: { onSubmit: (d: Partial<Movie>) => void; loading: boolean }) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | "">("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, genre, releaseYear: Number(releaseYear) });
      }}
      className="space-y-4"
    >
      <div className="space-y-2"><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div className="space-y-2"><Label>Genre</Label><Input required value={genre} onChange={(e) => setGenre(e.target.value)} /></div>
      <div className="space-y-2"><Label>Release Year</Label><Input required type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value === "" ? "" : Number(e.target.value))} /></div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Movie"}</Button>
      </DialogFooter>
    </form>
  );
}
