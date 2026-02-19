import { useEffect, useMemo, useState } from "react";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { Trade } from "../types/trade.type";

const formatPrice = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDirection = (value: number) => (value === 1 ? "Long" : "Short");
const getDirectionIcon = (value: number) =>
  value === 1 ? <ArrowUpwardIcon color="success" /> : <ArrowDownwardIcon color="error" />;
const sliceTradeId = (value: Trade["id"]) => String(value).slice(-12).toUpperCase();
type SortKey = "expiration" | "amount" | "direction";

const getAmountColor = (direction: number) => (direction === 1 ? "#2f9e44" : "#e03131");

const mapTrade = (trade: Trade) => ({
  id: `${trade.id}`,
  asset: {
    id: trade.asset?.id,
    name: trade.asset?.name,
  },
  expiration: trade.expiration,
  amount: trade.amount,
  direction: trade.direction,
  payout: trade.payout,
  color: getAmountColor(trade.direction),
});

const mapTrades = (data: Trade[] | Trade) => {
  if (Array.isArray(data)) {
    return data.map(mapTrade);
  }
  return [mapTrade(data)];
};

const TradesGrid = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<SortKey | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const tradeEndpoint = useMemo(() => {
    const baseUrl = process.env.REACT_APP_REST_URI!;
    return `${baseUrl}/api/Trade`;
  }, []);

  const generateEndpoint = useMemo(() => `${tradeEndpoint}/Generate`, [tradeEndpoint]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);

    fetch(tradeEndpoint, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        return response.json();
      })
      .then((data: Trade[]) => {
        setTrades(mapTrades(data));
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
  }, [tradeEndpoint]);

  const generateTrade = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(generateEndpoint);
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const data = (await response.json()) as Trade | Trade[];
      const newTrades = mapTrades(data);
      setTrades((currentTrades) => [...newTrades, ...currentTrades]);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteTrade = async (tradeId: string) => {
    setDeletingTradeId(tradeId);
    setErrorMessage(null);

    try {
      const response = await fetch(`${tradeEndpoint}/${encodeURIComponent(tradeId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      setTrades((currentTrades) => currentTrades.filter((trade) => trade.id !== tradeId));
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    } finally {
      setDeletingTradeId(null);
    }
  };

  const handleRequestSort = (property: SortKey) => {
    if (orderBy === property) {
      setOrder(order === "asc" ? "desc" : "asc");
      return;
    }

    setOrderBy(property);
    setOrder("asc");
  };

  const sortedTrades = useMemo(() => {
    if (!orderBy) {
      return trades;
    }

    const comparator = (a: Trade, b: Trade) => {
      const valueA = a[orderBy];
      const valueB = b[orderBy];

      if (valueA < valueB) {
        return order === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    };

    return [...trades].sort(comparator);
  }, [order, orderBy, trades]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={generateTrade}
          disabled={isLoading || isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </Stack>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {isLoading ? (
        <Typography color="text.secondary">Loading trades...</Typography>
      ) : (
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Asset</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} sortDirection={orderBy === "expiration" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "expiration"}
                      direction={orderBy === "expiration" ? order : "asc"}
                      onClick={() => handleRequestSort("expiration")}
                    >
                      Expiration
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} sortDirection={orderBy === "amount" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "amount"}
                      direction={orderBy === "amount" ? order : "asc"}
                      onClick={() => handleRequestSort("amount")}
                    >
                      Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} sortDirection={orderBy === "direction" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "direction"}
                      direction={orderBy === "direction" ? order : "asc"}
                      onClick={() => handleRequestSort("direction")}
                    >
                      Direction
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTrades.map((trade) => (
                  <TableRow key={trade.id} hover>
                    <TableCell title={String(trade.id)}>{sliceTradeId(trade.id)}</TableCell>
                    <TableCell>{trade.asset.name}</TableCell>
                    <TableCell>{trade.expiration}</TableCell>
                    <TableCell sx={{ color: trade.color, fontWeight: 600 }}>
                      ${formatPrice(trade.amount)}
                    </TableCell>
                    <TableCell aria-label={formatDirection(trade.direction)}>
                      {getDirectionIcon(trade.direction)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="Delete trade"
                        color="error"
                        disabled={deletingTradeId === trade.id}
                        onClick={() => deleteTrade(String(trade.id))}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No trades to display.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
};

export function Trades() {
  return (
    <>
      <AuthenticatedTemplate>
        <TradesGrid />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <TradesGrid />
      </UnauthenticatedTemplate>
    </>
  );
}
