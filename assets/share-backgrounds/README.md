# GO IRL share backgrounds

Asset intake for Messenger, Instagram, Telegram and system-share presentation cards.

## Source

Google Drive file ID: `1wndg3PXB3oOBtpErnUIleuEBqzSaRvzu`

Original archive: `go_irl_40_event_avatars.zip`

- 40 PNG files
- 1254 × 1254 px
- approximately 74 MB total

An optimized WebP archive was prepared during intake:

- `go_irl_share_backgrounds_webp.zip`
- 40 WebP files
- quality 82
- approximately 3.8 MB total

The original ZIP remains the archival source in Google Drive. Runtime extraction and category mapping belong to the implementation PR, not this planning PR.

## Files

1. `01-volleyball`
2. `02-football`
3. `03-basketball`
4. `04-tennis`
5. `05-gym`
6. `06-running`
7. `07-cycling`
8. `08-badminton`
9. `09-table-tennis`
10. `10-yoga`
11. `11-coffee`
12. `12-cinema`
13. `13-bowling`
14. `14-board-games`
15. `15-chess`
16. `16-karaoke`
17. `17-roller-skating`
18. `18-beer`
19. `19-pub-quiz`
20. `20-wine-evening`
21. `21-concert`
22. `22-festival`
23. `23-dancing`
24. `24-hiking`
25. `25-park-walk`
26. `26-swimming`
27. `27-picnic`
28. `28-camping`
29. `29-fishing`
30. `30-kayaking`
31. `31-city-walk`
32. `32-dinner`
33. `33-language-exchange`
34. `34-coworking`
35. `35-new-connections`
36. `36-drawing`
37. `37-photo-walk`
38. `38-ceramics`
39. `39-music-jam`
40. `40-workshop`

## Beta mapping priority

The first implementation pass must map only canonical beta categories:

- Volleyball → `01-volleyball`
- Running → `06-running`
- Walking → `25-park-walk` or `31-city-walk`, resolved by product review
- Coffee meetup → `11-coffee`
- Board games → `14-board-games`
- Language exchange → `33-language-exchange`

Do not expand create-event taxonomy merely because additional backgrounds exist.
