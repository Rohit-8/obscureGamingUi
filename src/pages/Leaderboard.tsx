import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import { EmojiEvents, Star } from "@mui/icons-material";
import { apiService } from "../services/ApiService";
import { LeaderboardEntry } from "../types";

const timeframeOptions = {
  today: "DAILY",
  week: "WEEKLY",
  month: "MONTHLY",
  all: "GLOBAL",
} as const;

type TimeframeKey = keyof typeof timeframeOptions;

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState<TimeframeKey>("all");
  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const timeframeFilter = timeframeOptions[timeframe];
        const entries = await apiService.getLeaderboard(timeframeFilter);
        if (!mounted) {
          return;
        }

        const normalized = (entries ?? []).map((entry) => ({
          ...entry,
          avatarInitial: entry.avatarInitial ?? entry.username?.charAt(0)?.toUpperCase() ?? "?",
        }));

        setLeaderboardData(normalized);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        if (!mounted) {
          return;
        }

        setError("Could not load leaderboard");
        setLeaderboardData([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      mounted = false;
    };
  }, [timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <EmojiEvents sx={{ color: "#FFD700" }} />;
      case 2:
        return <EmojiEvents sx={{ color: "#C0C0C0" }} />;
      case 3:
        return <EmojiEvents sx={{ color: "#CD7F32" }} />;
      default:
        return <Star sx={{ color: "text.secondary" }} />;
    }
  };

  const renderRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <Typography>Loading leaderboard...</Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <Typography color="error">{error}</Typography>
          </TableCell>
        </TableRow>
      );
    }

    return leaderboardData.map((player) => {
      const totalScore = player.totalScore ?? 0;
      const gamesPlayed = player.gamesPlayed ?? 0;
      const averageScore = gamesPlayed ? Math.round(totalScore / gamesPlayed) : 0;
      const avatarInitial = player.avatarInitial ?? player.username?.charAt(0)?.toUpperCase() ?? "?";

      return (
        <TableRow key={player.userId || `${player.rank}-${player.username}`} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getRankIcon(player.rank)}
              <Typography variant="h6">#{player.rank}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{avatarInitial}</Avatar>
              <Typography variant="subtitle1">{player.username}</Typography>
              {player.rank <= 3 && (
                <Chip size="small" label="Elite" color="primary" />
              )}
            </Box>
          </TableCell>
          <TableCell align="right">
            <Typography variant="h6" color="primary">
              {totalScore.toLocaleString()}
            </Typography>
          </TableCell>
          <TableCell align="right">{gamesPlayed}</TableCell>
          <TableCell align="right">{averageScore}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🏆 Leaderboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Top players and their achievements
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={(_, value: TimeframeKey | null) => value && setTimeframe(value)}
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="week">This Week</ToggleButton>
          <ToggleButton value="month">This Month</ToggleButton>
          <ToggleButton value="all">All Time</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="right">Total Score</TableCell>
                <TableCell align="right">Games Played</TableCell>
                <TableCell align="right">Avg Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderRows()}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Leaderboard;
