import LinkStatusBadge from "@/components/common/LinkStatusBadge";
import SearchInput from "@/components/common/searchInput";
import { useClients } from "@/hooks/clients";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import ClientCard from "./clientCard";
import { Button } from "@heroui/react";

export default function ClientCarousel({ onClick }) {
  const [searchString, setSearchString] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Scroll handler
  const scrollRef = React.useRef(null);
  const scrollToCard = (index) => {
    if (scrollRef.current && filteredClients.length > 0) {
      const card = scrollRef.current.children[index];
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  };

  const handleLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };
  const handleRight = () => {
    if (currentIndex < filteredClients.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  React.useEffect(() => {
    scrollToCard(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, filteredClients.length]);

  return (
    <div className="w-full border-r border-zinc-800 flex flex-col bg-black">
      <div className="flex px-8 items-center justify-between py-6 border-zinc-800 gap-3">
        <div className="flex items-center gap-4">
          <SearchInput
            placeholder="Search clients..."
            value={searchString}
            variant=""
            onChange={(e) => setSearchString(e.target.value)}
            className="w-[400px]"
          />

          {loading && (
            <div className="flex w-fit px-4 text-center text-zinc-400">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="w-full">Loading clients...</p>
            </div>
          )}
          <Button
            type="submit"
            color="primary"
            variant="bordered"
            className="w-full border  bg-transparent hover:bg-zinc-800 border-zinc-700 text-white  h-12 mb-4"
            size="sm"
          >
            Reset
          </Button>
        </div>
        {/* Carousel Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLeft}
            className="ml-4 p-2 rounded-full border border-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          {/* Counter */}
          <span className=" text-white text-sm min-w-[60px] text-center">
            {filteredClients.length === 0
              ? "0/0"
              : `${currentIndex + 1} / ${filteredClients.length}`}
          </span>
          <button
            onClick={handleRight}
            className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40"
            disabled={
              currentIndex === filteredClients.length - 1 ||
              filteredClients.length === 0
            }
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 ">
        <div
          className="flex gap-2 overflow-x-auto scrollbar-dark pl-8 pb-8"
          ref={scrollRef}
          style={{ scrollBehavior: "smooth" }}
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

          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      </div>
    </div>
  );
}
