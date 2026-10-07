import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type StocktakeStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type Stocktake = {
    id: string;
    createdAt: string;
    status: StocktakeStatus;
    discrepancyCount: number;
};

export default function StocktakePage() {
    const navigate = useNavigate();

    const [stocktakes, setStocktakes] = useState<Stocktake[]>([]);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unfinishedStocktake = useMemo(
        () => stocktakes.find((stocktake) => stocktake.status === "IN_PROGRESS"),
        [stocktakes]
    );

    useEffect(() => {
        loadStocktakes();
    }, []);

    async function loadStocktakes() {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/v1/stocktakes");

            if (!response.ok) {
                throw new Error("Failed to load stocktakes");
            }

            const data = await response.json();
            setStocktakes(data);
        } catch (err) {
            setError("Unable to load previous stocktakes.");
        } finally {
            setLoading(false);
        }
    }

    async function startNewStocktake() {
        try {
            setStarting(true);
            setError(null);

            const response = await fetch("/api/v1/stocktakes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to start stocktake");
            }

            const stocktake = await response.json();

            navigate(`/stocktake/${stocktake.id}/count`);
        } catch (err) {
            setError("Unable to start a new stocktake.");
        } finally {
            setStarting(false);
        }
    }

    function handleStocktakeClick(stocktake: Stocktake) {
        if (stocktake.status === "IN_PROGRESS") {
            navigate(`/stocktake/${stocktake.id}/count`);
        }

        if (stocktake.status === "COMPLETED") {
            navigate(`/stocktake/${stocktake.id}/review`);
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }

    function getStatusLabel(status: StocktakeStatus) {
        switch (status) {
            case "IN_PROGRESS":
                return "In Progress";
            case "COMPLETED":
                return "Completed";
            case "CANCELLED":
                return "Cancelled";
        }
    }

   }