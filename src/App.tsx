import React from "react";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./auth/auth";
import { OfflineProvider } from "./fieldOfficer/context/OfflineContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <RouterProvider router={router} />
      </OfflineProvider>
    </AuthProvider>
  );
}
