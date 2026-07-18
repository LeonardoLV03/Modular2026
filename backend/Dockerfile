FROM swipl:stable

WORKDIR /app

COPY server.pl .

ENV PORT=5000

EXPOSE ${PORT}

CMD ["swipl", "server.pl"]