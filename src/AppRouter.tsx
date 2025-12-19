import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import Discover from "./pages/Discover";
import ListDetail from "./pages/ListDetail";
import Library from "./pages/Library";
import CreateList from "./pages/CreateList";
import SearchTracks from "./pages/SearchTracks";
import Settings from "./pages/Settings";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/library" element={<Library />} />
        <Route path="/list/:listId" element={<ListDetail />} />
        <Route path="/create" element={<CreateList />} />
        <Route path="/search-tracks" element={<SearchTracks />} />
        <Route path="/settings" element={<Settings />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
