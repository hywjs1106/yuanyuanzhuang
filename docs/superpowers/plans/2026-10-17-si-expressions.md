# Si expressions and conversation refinement

User asks for Si-specific stickers, stronger persona and kaomoji after approving the chibi avatar. Preserve Fangyi, data isolation, all action validation and no-APK constraint.

Council: retain a separate six-entry static Si catalog, add ownership at parsing/render/import boundaries, preserve Fangyi's 178 animated entries. Modern self-assured artist/palm-sized playful reactions; no forced archaic speech, generic baby-talk, scene narration or invented shared history. One kaomoji at most and usually choose it OR a sticker; stay plain during distress or business clarification.

Implementation: six local static emotions (smile from existing avatar plus proud/thinking/surprised/comfort/sleepy derivatives); Si picker with preview-only behavior and optional kaomoji draft insertion; active-character IDs in JSON and backups, no remote static fallback or misleading play controls. Existing duplicate suppression stays. Offline curated matches are limited, conservative with negation and operational intent.

Verification: add failing boundary tests first, then run focused/full unit checks, relevant browser tests, actual 320/390 deep/light/keyboard/reload/mock-provider screenshots and web build. Original Si art/story references remain documented; adaptations are not official stickers. No APK.

Results: 6 new boundary tests observed failing before implementation, then passed; full 104 unit tests passed. Nine distinct browser scenarios passed across relevant runs (4 character flows, 2 new expression flows, 3 existing Fangyi sticker scenarios). Captures ui-28 cover all six decoded images, light/dark/320px, keyboard, kaomoji draft, offline and mock-provider reply; screenshots visually inspected. Real configured provider persona quality is not established by a mock. Reviewer found offline 别发晚安图 opt-out issue; fixed and regression covered. Keyboard click/focus loss reproduced with a stricter failing test and fixed using a Si-only pointer focus guard. Preview notice selector corrected. No APK built.
