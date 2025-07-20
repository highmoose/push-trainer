import Image from "next/image";
import React from "react";

export default function ClientImageCard({ selectedClient }) {
  console.log("Selected Client in Image Card:", selectedClient);
  return (
    <>
      <Image
        src="/images/placeholder/profile-image-placeholder-2.png"
        width={500}
        height={750}
        alt="logo"
        className="object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent "></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-50">
        <h2 className="text-4xl  text-white">{selectedClient?.first_name}</h2>
        <h2 className="text-4xl  text-white -mt-2">
          {selectedClient?.last_name}
        </h2>
        <p className="text-sm text-white">{selectedClient?.email}</p>
      </div>
    </>
  );
}
