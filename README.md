# 歷史記憶練習 v0.1.1

Mobile-first Chinese History practice PWA.

## v0.1.1

- One student account per device/browser
- Same-device return keeps the active account signed in until the user logs out
- Student UI copy cleaned up: removed redundant subtitles and question-count/mastery text on section cards
- 「我的」 renamed to 「帳戶」
- Student-facing teacher mode removed
- Opponent labels use the student name rather than generic 「對手／對方」 once cross-device sync is connected
- Question bank expanded from 40 to 90 source-grounded Japan questions/variants
- MC and selectable options reshuffle on every attempt
- Bookmarks, spaced review, concept-level weakness tracking, streaks and weekly scores retained

## Review logic

Wrong answers do not immediately repeat. The exact question is scheduled for a later review, while a different variant of the same concept may appear at most once later in the same normal session and only after at least eight intervening questions. Successful reviews move through roughly 1 → 3 → 7 → 14 → 30 → 60 days.

## Current limitation

Student progress is still stored in browser localStorage. One account per phone now matches the intended real usage, but Abby and Bonnie cannot yet share scores/challenges across separate devices until a backend such as Firebase is connected.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
