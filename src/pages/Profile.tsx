import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Grid,
  Chip,
  Button,
  TextField
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);

  const userStats = [
    { label: 'Games Played', value: '47' },
    { label: 'Total Score', value: '15,420' },
    { label: 'Time Played', value: '25h 30m' },
    { label: 'Achievements', value: '12' }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4">{user?.username}</Typography>
            <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
            <Chip label="Active Player" color="success" sx={{ mt: 1 }} />
          </Box>
          <Button startIcon={<Edit />} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Profile Information</Typography>
            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Username" defaultValue={user?.username} />
                <TextField label="Email" defaultValue={user?.email} />
                <TextField label="Bio" multiline rows={3} placeholder="Tell us about yourself..." />
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Gaming enthusiast exploring the world of interactive entertainment.
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Gaming Stats</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {userStats.map((stat, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>{stat.label}:</Typography>
                  <Chip label={stat.value} size="small" />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
