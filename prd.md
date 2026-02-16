# Cricket Team Availability & Match Management App - PRD

## 1. Overview
This app is designed for a local cricket team to manage season-long and match-specific availability, create teams, and share them easily. The goal is simplicity, speed, and minimal friction, with no login required for players.

## 2. User Roles

### 2.1 Player
- Mark availability for the season.
- Update availability per match.
- Update preferred roles.
- Receive reminders.
- View selected teams.
- **No login required.**

### 2.2 Captain / Admin
- Add season details and match schedules.
- View player availability.
- Create teams from available players.
- Assign roles and share final teams.
- Send reminders.
- Lock matches once teams are finalized.

## 3. Core Features & Details

### 3.1 Season Setup (Admin)
- **Create Season:** Name (e.g., "Summer 2026"), Start Date, End Date.
- **Add Players:** Name, Phone, Email (optional), Primary Role, Secondary Role, Notes.
- **Player Data:** Roles (Batsman, Bowler, All-rounder, Wicketkeeper), Batting Position, Bowling Type, Captain/Vice-Captain tags.

### 3.2 Season-Level Availability (Player)
- **Status:** Available for entire season, Not available, Partially available.
- **Partial Availability:** Mark specific weekends or date ranges as unavailable.
- **Access:** Unique link per player (no login).

### 3.3 Match Schedule Management (Admin)
- **Add Match:** Date, Opponent, Ground/Location, Type (League/Friendly), Reporting Time.
- **Manage Matches:** Edit, Delete, Mark as Upcoming/Completed/Cancelled.

### 3.4 Match-Level Availability (Player)
- **Status:** ✅ Available, ❌ Not Available, ❓ Maybe.
- **Notes:** Short notes (e.g., "Late by 30 mins").

### 3.5 Reminders (Admin)
- **Target:** All players, Non-responders, or "Maybe" players.
- **Content:** "Please update availability for Match on [Date]" with a direct link.

### 3.6 Team Selection (Admin)
- **Dashboard:** View total squad, available, not available, maybe, and no response. Filter by role.
- **Team Builder:** Select Playing XI + Subs. Show role summary (batsmen, bowlers, etc.) and warnings (e.g., no WK).
- **Assign Roles:** Captain, VC, WK, Opening Batsmen, Bowling Order.
- **Lock Team:** "Team Announced" status prevents further availability changes.

### 3.7 Team Sharing
- **Formats:** Text (WhatsApp-friendly), Image summary, Simple link.
- **WhatsApp Example:**
  ```text
  Match: vs ABC – 24 March
  Ground: XYZ Ground

  Playing XI:
  Name – Captain – Opener
  Name – Wicketkeeper
  ...
  ```

### 3.8 Player Role Management
- **Default Profile:** Primary/Secondary roles, Batting/Bowling styles.
- **Match Override:** Admin can override roles for specific matches (e.g., Bowler plays as All-rounder).

### 3.9 Dashboard (Admin)
- **Season Summary:** Total matches, upcoming matches.
- **Stats:** Attendance %, Most reliable players, Lowest response rate.

### 3.10 Notifications
- **Types:** Season start, Match availability, Team announcement, Last-minute updates.
- **Action:** Direct links in all messages.

## 4. User Flow

### 4.1 Player Flow
1. Receive link.
2. Open page (Season overview / Upcoming matches).
3. Mark availability.
4. Submit.

### 4.2 Admin Flow
1. Create season & add players.
2. Send season availability request.
3. Add match schedule.
4. Send match availability request.
5. Create & lock team.
6. Share team.

## 5. Technical Considerations
- **Platform:** Web-based (Mobile-first).
- **Authentication:** Token-based links for players (no password). Admin login required.
- **Database:** Relational DB (e.g., PostgreSQL/SQLite) for structured data.
- **Frontend:** React/Next.js for responsiveness.
- **Backend:** Node.js/Next.js API routes.

## 6. Future Enhancements
- Performance tracking (Runs, Wickets).
- Automated best XI suggestions.
- Dues/payment tracking.
- Multi-team support.

## 7. Success Criteria
- 100% player response via app.
- Team creation in < 3 minutes.
- Clear role visibility.
