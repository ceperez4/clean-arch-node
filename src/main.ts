import { envs } from "./config/envs";
import { ExpressServer } from "./expressServer";
import { FileSystemService } from "@/modules/shared/infrastructure/services/file-system";
import { HttpExpressRoutes, HttpFastifyRoutes } from "./http.routes";
import { FastifyServer } from "./fastifyServer";

(() => {
    main();
})();

async function main() {

    const pathFiles: string[] = [
        envs.pathUserFiles
    ]
    for (let path of pathFiles) {
        await new FileSystemService().createFolderAsync(path);
    }

    /*
    const server = new ExpressServer(
        envs.port  
    );

    server.initializeRoutes(HttpExpressRoutes.routes);
    server.listen();
    */
    const server = new FastifyServer(envs.port);
    server.initializeRoutes(HttpFastifyRoutes.routes)
    await server.listen();
}