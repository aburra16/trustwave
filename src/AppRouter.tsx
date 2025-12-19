import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import Discover from "./pages/Discover";
import ListDetail from "./pages/ListDetail";
import Library from "./pages/Library";
import CreateList from "./pages/CreateList";
import SearchTracks from "./pages/SearchTracks";
import AddTrackToList from "./pages/AddTrackToList";
import Settings from "./pages/Settings";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Static routes first */}
        <Route path="/" element={<Index />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/library" element={<Library />} />
        <Route path="/create" element={<CreateList />} />
        <Route path="/search-tracks" element={<SearchTracks />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Dynamic routes with prefixes */}
        <Route path="/list/:listId" element={<ListDetail />} />
        <Route path="/add-track/:listId" element={<AddTrackToList />} />
        
        {/* NIP-19 route - must be LAST before catch-all since it matches any single segment */}
        {/* This only matches valid NIP-19 identifiers (npub1, note1, naddr1, nevent1, nprofile1) */}
        <Route path="/:nip19" element={<NIP19Page />} />
        
        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
