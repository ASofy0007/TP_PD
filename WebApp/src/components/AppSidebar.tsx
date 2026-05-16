import { useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Film,
  Users,
  History,
  Clapperboard,
  LogOut,
  Pencil,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { UsersAPI } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Movies", url: "/movies", icon: Film },
  { title: "Users", url: "/users", icon: Users },
  { title: "My History", url: "/history", icon: History },
];

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { user, logout, login } = useAuth();
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  const handleLogout = () => {
    logout();
    nav({ to: "/login" });
  };

  const handleSave = async () => {
    if (!user) return;
    if (name === user.name) {
      setOpen(false);
      return;
    }

    try {
      const updated = await UsersAPI.update(user._id, {
        name,
      });

      login(updated); // atualiza estado global
      setOpen(false);

      toast.success("Name updated");
    } catch {
      toast.error("Failed to update name");
    }
  };

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* HEADER */}
      <div className="flex items-center gap-2 px-6 h-16 border-b">
        <Clapperboard className="h-6 w-6 text-primary" />
        <span className="font-semibold">CineTrack</span>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.url;

          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* USER SECTION */}
      {user && (
        <div className="border-t p-3 space-y-2">
          <div className="px-2 py-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">
                {user.name}
              </span>

              {/* EDIT BUTTON */}
              <button
                onClick={() => {
                  setName(user?.name ?? "");
                  setOpen(true);
                }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}

      {/* MODAL EDIT NAME */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit name</DialogTitle>
          </DialogHeader>
        
          <div className="flex gap-2 items-center">
            <Input
              className="flex-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <Button onClick={handleSave}>
              Save
            </Button>
          </div>

          <div></div>
        <div className="flex items-center gap-2">

          <DialogHeader className="flex-1">
            <DialogTitle>Delete Account:</DialogTitle>
          </DialogHeader>

          <Button
            variant="destructive"
            onClick={async () => {
              if (!user) return;

              const confirmed = confirm(
                "Are you sure you want to delete your account?"
              );

              if (!confirmed) return;

              try {
                await UsersAPI.remove(user._id);

                logout();

                toast.success("Account deleted");

                nav({ to: "/login" });

              } catch {
                toast.error("Failed to delete account");
              }
            }}
          >
            Delete Account
          </Button>
        </div>
          

          <DialogFooter className="flex justify-between">
            
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}