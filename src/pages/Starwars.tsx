import { useEffect, useMemo, useState } from "react";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  Link,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Movie } from "../types/movie.type";

const providers = ["CinemaWorld", "FilmWorld"] as const;
type Provider = (typeof providers)[number];

const formatPrice = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });
const defaultPosterSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='360' viewBox='0 0 240 360'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><rect x='16' y='16' width='208' height='328' rx='12' ry='12' fill='%23e0e0e0' stroke='%23c7c7c7'/><text x='120' y='180' font-family='Arial, sans-serif' font-size='18' fill='%23777777' text-anchor='middle' dominant-baseline='middle'>NO IMAGE</text></svg>";
const normalizeMovie = (data: Record<string, unknown>): Movie => {
  return {
    movieId: String(data.id),
    title: String(data.title),
    year: String(data.year),
    poster: String(data.poster),
    price: Math.floor(Math.random() * 20) + 5,
    isActive: Boolean(data.isActive)
  };
};

const StarwarsContent = () => {
  const [provider, setProvider] = useState<Provider>("CinemaWorld");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [brokenPosterIds, setBrokenPosterIds] = useState<Set<string>>(new Set());
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const apiBase = process.env.REACT_APP_STRAWARS_URI;

  const endpoint = useMemo(() => {
    if (!apiBase) {
      return null;
    }
    return `${apiBase}/api/webjet/${provider}`;
  }, [apiBase, provider]);

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearB - yearA;
    });
  }, [movies]);

  useEffect(() => {
    if (!endpoint) {
      setErrorMessage("Missing REACT_APP_STRAWARS_URI configuration.");
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);

    fetch(endpoint, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        return response.json();
      })
      .then((data: unknown) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as { movies?: unknown[] }).movies)
            ? (data as { movies: unknown[] }).movies
            : [];
        const normalized = list.map((item) => normalizeMovie(item as Record<string, unknown>));
        setMovies(normalized);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [endpoint]);

  const fetchMovieDetails = async (movie: Movie) => {
    if (!apiBase) return;
    
    setSelectedMovie(movie);
    setIsLoadingDetails(true);
    setDetailsError(null);
    setMovieDetails(null);

    try {
      const detailsEndpoint = `${apiBase}/api/webjet/${provider}/${movie.movieId}`;
      const response = await fetch(detailsEndpoint);
      
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }
      
      const data = await response.json();
      setMovieDetails(data);
    } catch (error) {
      setDetailsError(error instanceof Error ? error.message : 'Failed to load movie details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedMovie(null);
    setMovieDetails(null);
    setDetailsError(null);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Link
          href={apiBase}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="inherit"
          sx={{ fontWeight: 600, fontSize: "1.5rem" }}
        >
          StarWars API
        </Link>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="starwars-provider-label">Provider</InputLabel>
          <Select
            labelId="starwars-provider-label"
            value={provider}
            label="Provider"
            onChange={(event) => setProvider(event.target.value as Provider)}
          >
            {providers.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Typography color="text.secondary">Loading movies...</Typography>
      ) : (
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Year</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMovies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ color: "text.secondary" }}>
                      No movies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedMovies.map((movie) => (
                    <TableRow key={`${movie.movieId}-${movie.title}`}>
                      <TableCell>
                        <Link
                          href={`${apiBase}/api/webjet/${provider}/${movie.movieId}`}
                          underline="hover"
                          onClick={(event) => {
                            event.preventDefault();
                            fetchMovieDetails(movie);
                          }}
                        >
                          {movie.movieId.toUpperCase()}
                        </Link>
                      </TableCell>
                      <TableCell>{movie.title}</TableCell>
                      <TableCell>{movie.year}</TableCell>
                      <TableCell>{formatPrice(movie.price)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog
        open={Boolean(selectedMovie)}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
          {selectedMovie?.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {isLoadingDetails ? (
            <Box sx={{ width: '100%', py: 2 }}>
              <LinearProgress />
            </Box>
          ) : detailsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>{detailsError}</Alert>
          ) : movieDetails ? (
            <Stack direction="row" spacing={3} alignItems="flex-start">
              {selectedMovie?.poster && !brokenPosterIds.has(selectedMovie.movieId) ? (
                <Box
                  component="img"
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  onError={() => {
                    if (!selectedMovie) {
                      return;
                    }
                    setBrokenPosterIds((current) => {
                      const next = new Set(current);
                      next.add(selectedMovie.movieId);
                      return next;
                    });
                  }}
                  sx={{
                    width: 180,
                    height: 270,
                    borderRadius: 2,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={defaultPosterSrc}
                  alt="No poster available"
                  sx={{
                    width: 180,
                    height: 270,
                    borderRadius: 2,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Year: {selectedMovie?.year ?? ""} | Price: {selectedMovie ? formatPrice(selectedMovie.price) : ""}
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: "grey.100",
                    borderRadius: 1,
                    p: 2,
                    overflow: "auto",
                    maxHeight: 400,
                    fontSize: "0.875rem",
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  {JSON.stringify(movieDetails, null, 2)}
                </Box>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export function Starwars() {
  return (
    <>
      <AuthenticatedTemplate>
        <StarwarsContent />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Alert severity="info">Sign in to view Starwars movies.</Alert>
      </UnauthenticatedTemplate>
    </>
  );
}
