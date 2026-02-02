import { NextPageContext } from "next";

interface ErrorProps {
  statusCode: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 300, margin: 0 }}>
          {statusCode || "Error"}
        </h1>
        <p style={{ color: "#666", marginTop: "1rem" }}>
          {statusCode === 404
            ? "Page not found"
            : "An error occurred"}
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            background: "#6b8e5e",
            color: "white",
            borderRadius: "0.5rem",
            textDecoration: "none",
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
