import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MoviesAPI, UsersAPI, HistoryAPI, getHistoryMovie } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Film, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const movies = useQuery({ queryKey: ["movies"], queryFn: MoviesAPI.list });
  const history = useQuery({
    queryKey: ["history", user?._id],
    queryFn: () => UsersAPI.history(user!._id),
    enabled: !!user,
  });
  const unwatched = useQuery({
    queryKey: ["unwatched", user?._id],
    queryFn: () => HistoryAPI.unwatched(user!._id),
    enabled: !!user,
  });

  const watchedCount = history.data?.length ?? 0;
  const unwatchedCount = unwatched.data?.length ?? 0;
  const total = (movies.data?.length ?? 0) || watchedCount + unwatchedCount;
  const pct = total ? Math.round((watchedCount / total) * 100) : 0;

  const stats = [
    { label: "Watched", value: watchedCount, icon: Eye, color: "text-green-600" },
    { label: "Not Watched", value: unwatchedCount, icon: EyeOff, color: "text-amber-600" },
    { label: "Total Movies", value: total, icon: Film, color: "text-primary" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader title="My Dashboard" subtitle={user ? `Welcome back, ${user.name}` : "Overview"} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{history.isLoading ? "—" : s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Watch progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{watchedCount} of {total} watched</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent watch history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {history.isError && <p className="text-destructive text-sm">Failed to load history.</p>}
          {history.data && history.data.length === 0 && (
            <p className="text-muted-foreground text-sm">No movies watched yet.</p>
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
                {history.data.slice(0, 8).map((e) => {
                  const m = getHistoryMovie(e);
                  return (
                    <TableRow key={e._id}>
                      <TableCell className="font-medium">{m?.title ?? e.title ?? "—"}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {e.watchedAt ? new Date(e.watchedAt).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
