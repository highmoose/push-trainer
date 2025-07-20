import LinkStatusBadge from "@/components/common/LinkStatusBadge";
import SearchInput from "@/components/common/searchInput";
import { useClients } from "@/api/clients";
import { Users, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import React, { useState } from "react";
import ClientCard from "./clientCard";
import { Input, Button } from "@heroui/react";

export default function ClientCarousel({
  onClick,
  setAddClientModalOpen,
  setSelectedClient,
}) {
  const [searchString, setSearchString] = useState("");
  const scrollContainerRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = React.useState(0);
  const { clients, loading, error, fetchClients } = useClients();

  const filteredClients = clients
    .filter((client) => {
      const search = (searchString ?? "").toLowerCase();
      const fullName = `${client.first_name ?? ""} ${
        client.last_name ?? ""
      }`.toLowerCase();
      const email = (client.email ?? "").toLowerCase();
      return fullName.includes(search) || email.includes(search);
    })
    .map((client) => ({
      ...client,
      name: `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim(),
      created_at: new Date(client.created_at).toLocaleDateString(),
      role:
        client.role?.charAt(0).toUpperCase() + client.role?.slice(1) ||
        "Client",
      is_temp_badge: <LinkStatusBadge isTemp={client.is_temp} />,
    }));

  // Handle scroll navigation
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400, // Scroll by card width + gap
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400, // Scroll by card width + gap
        behavior: "smooth",
      });
    }
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setInitialScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
    // Disable smooth scrolling during drag for better responsiveness
    scrollContainerRef.current.style.scrollBehavior = "auto";
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = startX - x; // Corrected direction: when mouse moves right, scroll left
    scrollContainerRef.current.scrollLeft = initialScrollLeft + walk;
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = "grab";
    scrollContainerRef.current.style.userSelect = "auto";
    // Re-enable smooth scrolling for arrow controls
    scrollContainerRef.current.style.scrollBehavior = "smooth";
  };

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = "grab";
    scrollContainerRef.current.style.userSelect = "auto";
    // Re-enable smooth scrolling
    scrollContainerRef.current.style.scrollBehavior = "smooth";
  };

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setInitialScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.scrollBehavior = "auto";
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = startX - x; // Corrected direction: when finger moves right, scroll left
    scrollContainerRef.current.scrollLeft = initialScrollLeft + walk;
  };

  const handleTouchEnd = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.scrollBehavior = "smooth";
  };

  // Check if we can scroll left or right
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScrollability = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener("scroll", checkScrollability);
      return () => container.removeEventListener("scroll", checkScrollability);
    }
  }, [checkScrollability, filteredClients]);

  return (
    <div className="w-full  border-r border-zinc-800 flex flex-col bg-black/20 h-[400px]">
      <div className="flex px-4 items-center justify-between gap-4 py-6 border-zinc-800 ">
        <div className="flex gap-2 items-center ">
          <Input
            placeholder="Search clients..."
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="w-[400px]"
            classNames={{
              input: "bg-transparent",
              inputWrapper: "bg-panel rounded-d border-none h-12",
            }}
            startContent={
              <div className="pointer-events-none flex items-center">
                <svg
                  className="w-4 h-4 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            }
          />

          <Button
            onClick={() => setAddClientModalOpen(true)}
            className="bg-panel rounded-d h-12 px-6"
          >
            <Plus size={16} /> Add Client
          </Button>
        </div>

        {/* Carousel Controls */}
        {filteredClients.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`p-3 rounded-xl transition-colors ${
                !canScrollLeft
                  ? "bg-panel text-zinc-600 cursor-not-allowed"
                  : "border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500 bg-panel"
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 text-sm">
              <span className="text-zinc-400">Showing</span>

              <span className="text-zinc-400">{filteredClients.length}</span>
              <span className="text-zinc-400">clients</span>
            </div>

            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`p-3 rounded-xl transition-colors ${
                !canScrollRight
                  ? "bg-panel text-zinc-600 cursor-not-allowed"
                  : "border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500 bg-panel"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div
        ref={scrollContainerRef}
        className="flex pl-4 gap-2 pb-4 overflow-x-auto overflow-y-hidden scrollbar-dark z-10 scroll-smooth mb-10 cursor-grab select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
        }}
      >
        {error && (
          <div className="p-4 text-center text-red-400">
            <p>Failed to load clients: {error}</p>{" "}
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredClients.length === 0 && (
          <div className="p-4 text-center text-zinc-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No clients found</p>{" "}
            <button
              onClick={() => {
                setSelectedClient(null); // Clear selected client for new addition
                setAddClientModalOpen(true);
              }}
              className="mt-2 text-sm text-emerald-400 hover:text-emerald-300"
            >
              Add your first client
            </button>
          </div>
        )}

        {loading && (
          <div className="flex  h-full mx-auto self-item-center px-4 text-center text-zinc-400">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="w-full">Loading clients...</p>
          </div>
        )}

        {!loading && (
          <>
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} onClick={onClick} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

