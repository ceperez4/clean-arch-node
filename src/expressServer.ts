import express, { Application, Router } from 'express'
import cors from 'cors';

export class ExpressServer {
    private port: number;
    app: Application;

    constructor(
        port: number,
    ) {

        this.port = port;
        this.app = express();
        this.initializeMiddlewares();
    }

    private initializeMiddlewares() {
        this.app.use(express.json({ limit: '1000mb' }));
        this.app.use(express.urlencoded());
        this.app.use(
            cors({
                origin: "*",
                methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            })
        );
    }

    initializeRoutes(router: Router) {
        this.app.use('/api', router);
        this.app.use('/files', express.static('src/public/'));
        this.app.use((req, res) => {
            res.status(404).json({ message: `route not found: ${req.originalUrl}` });
        });
    }

    listen() {
        this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`Server with express listenning on port ${this.port}`);
        });
    }
}


