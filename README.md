# Digital Notes App

By **Leonard Walujan**, using Next.js TypeScript, MongoDB, and Prisma.

Feel free to give some suggestions or bug report by send them to the Issues tab.

## Docker

```
docker build \
  --build-arg ENV=production \
  --build-arg DATABASE_URL="" \
  --build-arg JWT_SECRET="" \
  --build-arg CSRF_SECRET="" \
  -t digitalnotes .

docker run -d -p 127.0.0.1:3005:3000 --name digitalnotes digitalnotes
```
