import { Router } from "express";

// Types
import { ProductErrors } from "@models";

// Services
import {
    RequestService,
    ResponseService,
    ProductService,
    JWTService,
    OperatorService,
} from "@services";

const router = Router();

router.get("/", (req, res) => {
    ProductService.query({
        id: RequestService.queryParamToString(req.query.id),
        name: RequestService.queryParamToString(req.query.name),
        realmId: RequestService.queryParamToString(req.query.realmId),
        parentId: RequestService.queryParamToString(req.query.parentId),
    })
        .then((response) => {
            res.status(200).json(
                ResponseService.generateSucessfulResponse(response)
            );
        })
        .catch((error) => {
            res.status(500).json(
                ResponseService.generateFailedResponse(error.message)
            );
        });
});

router.get("/self", async (req, res) => {
    try {
        const decodedAccessToken = JWTService.decodeAccessToken(
            req.cookies[process.env.COOKIE_NAME]
        );

        const foundOperator = await OperatorService.queryByUserName(
            decodedAccessToken.userName
        );

        const foundProducts = await ProductService.query({
            realmId: foundOperator.realm._id.toString(),
        });

        res.status(200).json(
            ResponseService.generateSucessfulResponse(foundProducts)
        );
    } catch (error) {
        res.status(error.code ?? 500).json(
            ResponseService.generateFailedResponse(error.message)
        );
    }
});

router.post("/", (req, res) => {
    const name = RequestService.queryParamToString(req.body.name);
    const realmId = RequestService.queryParamToString(req.body.realmId);
    const parentId = RequestService.queryParamToString(req.body.parentId);

    if (!name || !realmId) {
        res.status(400).json(
            ResponseService.generateFailedResponse(ProductErrors.INVALID)
        );

        return;
    }

    ProductService.save({
        name: name,
        realmId: realmId,
        parentId: parentId,
    })
        .then((response) => {
            res.status(200).json(
                ResponseService.generateSucessfulResponse(response)
            );
        })
        .catch((error) => {
            res.status(500).json(
                ResponseService.generateFailedResponse(error.message)
            );
        });
});

router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const name = RequestService.queryParamToString(req.body.name);

    if (!id) {
        res.status(400).json(
            ResponseService.generateFailedResponse(ProductErrors.INVALID)
        );

        return;
    }

    ProductService.update(id, { name: name })
        .then((response) => {
            res.status(200).json(
                ResponseService.generateSucessfulResponse(response)
            );
        })
        .catch((error) => {
            res.status(500).json(
                ResponseService.generateFailedResponse(error.message)
            );
        });
});

router.delete("/:id", (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json(
            ResponseService.generateFailedResponse(ProductErrors.INVALID)
        );

        return;
    }

    ProductService.delete(id)
        .then((response) => {
            if (!response) {
                res.status(404).json(
                    ResponseService.generateFailedResponse(
                        ProductErrors.NOT_FOUND
                    )
                );

                return;
            }

            res.status(200).json(
                ResponseService.generateSucessfulResponse(response)
            );
        })
        .catch((error) => {
            res.status(500).json(
                ResponseService.generateFailedResponse(error.message)
            );
        });
});

export default router;
