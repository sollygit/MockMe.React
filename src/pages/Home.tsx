import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import movies from "../assets/movies.json";
import type { Movie } from "../types/movie.type";

const formatPrice = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MovieGrid = () => {
  const activeMovies = (movies as Movie[]).filter((movie) => movie.isActive);

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {activeMovies.map((movie) => (
          <Grid item xs={12} sm={6} key={movie.movieId}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <CardContent sx={{ pb: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${formatPrice(movie.price)} / {movie.year}
                </Typography>
              </CardContent>
              <Box sx={{ px: 2 }}>
                <Divider sx={{ my: 2 }} />
              </Box>
              <CardMedia
                component="img"
                height="320"
                image={movie.poster}
                alt={movie.title}
                sx={{ objectFit: "cover" }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export function Home() {
  return (
      <>
          <AuthenticatedTemplate>
              <MovieGrid />
          </AuthenticatedTemplate>

          <UnauthenticatedTemplate>
              <MovieGrid />
          </UnauthenticatedTemplate>
      </>
  );
}
