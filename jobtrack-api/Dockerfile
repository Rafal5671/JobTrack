FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o jobtrack .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/jobtrack .
COPY --from=builder /app/templates ./templates

EXPOSE 8080

CMD ["./jobtrack"]
