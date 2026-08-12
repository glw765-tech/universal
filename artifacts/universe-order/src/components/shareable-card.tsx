import { forwardRef } from "react";
import { format } from "date-fns";

interface ShareableCardProps {
  intention: string;
  confirmedAt?: string | null;
}

const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ intention, confirmedAt }, ref) => {
    const date = confirmedAt
      ? format(new Date(confirmedAt), "MMMM d, yyyy")
      : format(new Date(), "MMMM d, yyyy");

    return (
      <div
        ref={ref}
        style={{
          width: "600px",
          height: "600px",
          background: "linear-gradient(135deg, #0a0a0f 0%, #12101e 40%, #0d0d16 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Star field background */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: i % 5 === 0 ? "2px" : "1px",
              height: i % 5 === 0 ? "2px" : "1px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: "50%",
              top: `${(i * 23 + 7) % 100}%`,
              left: `${(i * 37 + 13) % 100}%`,
              opacity: 0.3 + (i % 4) * 0.15,
            }}
          />
        ))}

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Top decorative line */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "60px",
            right: "60px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)",
          }}
        />
        {/* Bottom decorative line */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "60px",
            right: "60px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          {/* Top label */}
          <p
            style={{
              color: "rgba(251,191,36,0.7)",
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
            }}
          >
            ✦ &nbsp; Manifested &nbsp; ✦
          </p>

          {/* Intention */}
          <p
            style={{
              color: "#f5f0e8",
              fontSize: intention.length > 80 ? "22px" : "26px",
              lineHeight: 1.5,
              fontStyle: "italic",
              maxWidth: "420px",
            }}
          >
            "{intention}"
          </p>

          {/* Divider dot */}
          <div
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: "rgba(251,191,36,0.5)",
              boxShadow: "0 0 8px rgba(251,191,36,0.6)",
            }}
          />

          {/* Date */}
          <p
            style={{
              color: "rgba(245,240,232,0.5)",
              fontSize: "13px",
              letterSpacing: "0.15em",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
            }}
          >
            {date}
          </p>

          {/* App name */}
          <p
            style={{
              color: "rgba(251,191,36,0.45)",
              fontSize: "10px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
              marginTop: "8px",
            }}
          >
            Universal Order
          </p>
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = "ShareableCard";
export default ShareableCard;
