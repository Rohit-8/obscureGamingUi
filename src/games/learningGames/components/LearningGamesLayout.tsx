import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  School as SchoolIcon,
  Science as ScienceIcon,
  Functions as MathIcon,
  Biotech as ChemistryIcon,
  Games as GamesIcon,
} from '@mui/icons-material';
import { LearningGameData, Subject, GameClass } from '../types';

const drawerWidth = 280;

interface LearningGamesLayoutProps {
  children: React.ReactNode;
  selectedClass: GameClass | null;
  selectedSubject: Subject | null;
  selectedGame: string | null;
  onClassSelect: (gameClass: GameClass) => void;
  onSubjectSelect: (subject: Subject) => void;
  onGameSelect: (gameId: string) => void;
  gameData: LearningGameData;
}

export const LearningGamesLayout: React.FC<LearningGamesLayoutProps> = ({
  children,
  selectedClass,
  selectedSubject,
  selectedGame,
  onClassSelect,
  onSubjectSelect,
  onGameSelect,
  gameData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<number[]>([]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClassExpand = (classNumber: number) => {
    setExpandedClasses(prev => 
      prev.includes(classNumber) 
        ? prev.filter(c => c !== classNumber)
        : [...prev, classNumber]
    );
  };

  const getSubjectIcon = (subject: Subject) => {
    switch (subject) {
      case 'Physics':
        return <ScienceIcon />;
      case 'Chemistry':
        return <ChemistryIcon />;
      case 'Mathematics':
        return <MathIcon />;
      default:
        return <GamesIcon />;
    }
  };

  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case 'Physics':
        return '#2196f3';
      case 'Chemistry':
        return '#4caf50';
      case 'Mathematics':
        return '#ff9800';
      default:
        return '#9c27b0';
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          🎓 Learning Games
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      
      <List>
        {/* All Games Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => window.location.href = '/games'}
            sx={{
              mb: 1,
              backgroundColor: 'rgba(96, 165, 250, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(96, 165, 250, 0.2)',
              },
            }}
          >
            <ListItemIcon>
              <GamesIcon sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="← All Games"
              primaryTypographyProps={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: 1 }} />
        
        {[9, 10, 11, 12].map((classNumber) => (
          <React.Fragment key={classNumber}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleClassExpand(classNumber)}
                sx={{
                  backgroundColor: selectedClass === classNumber ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                }}
              >
                <ListItemIcon>
                  <SchoolIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary={`Class ${classNumber}`}
                  secondary={`${Object.keys(gameData[classNumber as GameClass] || {}).length} subjects`}
                />
                {expandedClasses.includes(classNumber) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={expandedClasses.includes(classNumber)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {Object.entries(gameData[classNumber as GameClass] || {}).map(([subject, games]) => {
                  const gameList = games as any[];
                  return (
                  <React.Fragment key={subject}>
                    <ListItem disablePadding>
                      <ListItemButton
                        sx={{ 
                          pl: 4,
                          backgroundColor: selectedSubject === subject && selectedClass === classNumber 
                            ? `rgba(${getSubjectColor(subject as Subject)}, 0.1)` 
                            : 'transparent',
                        }}
                        onClick={() => {
                          onClassSelect(classNumber as GameClass);
                          onSubjectSelect(subject as Subject);
                        }}
                      >
                        <ListItemIcon>
                          {getSubjectIcon(subject as Subject)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={subject}
                          secondary={`${gameList.length} games`}
                        />
                      </ListItemButton>
                    </ListItem>
                    
                    {selectedSubject === subject && selectedClass === classNumber && (
                      <Collapse in={true} timeout="auto">
                        <List component="div" disablePadding>
                          {gameList.map((game: any) => (
                            <ListItem key={game.id} disablePadding>
                              <ListItemButton
                                sx={{ 
                                  pl: 6,
                                  backgroundColor: selectedGame === game.id 
                                    ? 'rgba(25, 118, 210, 0.12)'
                                    : 'transparent',
                                }}
                                onClick={() => onGameSelect(game.id)}
                              >
                                <ListItemIcon>
                                  <GamesIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={game.title}
                                  secondary={game.topic}
                                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                                  secondaryTypographyProps={{ fontSize: '0.8rem' }}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </React.Fragment>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const breadcrumbs = (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link
        underline="hover"
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        color="inherit"
        onClick={() => {
          onClassSelect(null as any);
          onSubjectSelect(null as any);
          onGameSelect('');
        }}
      >
        <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        Learning Games
      </Link>
      
      {selectedClass && (
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => {
            onSubjectSelect(null as any);
            onGameSelect('');
          }}
        >
          Class {selectedClass}
        </Link>
      )}
      
      {selectedSubject && (
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => onGameSelect('')}
        >
          {getSubjectIcon(selectedSubject)}
          <Typography sx={{ ml: 0.5 }}>{selectedSubject}</Typography>
        </Link>
      )}
      
      {selectedGame && selectedClass && selectedSubject && (
        <Chip
          label={(gameData[selectedClass][selectedSubject] as any[])?.find((g: any) => g.id === selectedGame)?.title || 'Game'}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Breadcrumbs>
  );

  return (
    <Box sx={{ display: 'flex', pt: 2 }}>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: 'calc(100vh - 64px)', // Account for main navbar
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {breadcrumbs}
          {children}
        </Container>
      </Box>
    </Box>
  );
};