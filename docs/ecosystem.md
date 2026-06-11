# Ecosystem

Rearview exposes public provider and reviewer-agent interfaces so local plugins can import review data, render structured comments, post or reply to threads, and export review summaries. The first marketplace is local configuration, not a hosted service.

Review stories can be archived as `rearview.bundle.v1`, which contains the story, threads, provider plugin descriptors, and export timestamp. Browser-side provider overlays should consume local-server story data instead of becoming a merge path.
