import { Request, Response } from "express";
import mongoose from "mongoose";
import { ZipArchive } from "archiver";
import { format } from "date-fns";
import AppError from "../../errors/appErrors";

const backupDatabase = async (
    req: Request,
    res: Response
) => {
    try {
        const db = mongoose.connection.db;

        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Database connection is not available",
            });
        }

        const collections = await db
            .listCollections()
            .toArray();

        const fileName = `mi-backup-${format(new Date(), 'dd/MM/yyyy')}`;

        res.setHeader(
            "Content-Type",
            "application/zip"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        // Archiver v8
        const archive = new ZipArchive({
            zlib: {
                level: 9,
            },
        });

        archive.on("error", (error) => {
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to create backup",
                });
            }
        });

        archive.pipe(res);

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;

            const documents = await db
                .collection(collectionName)
                .find({})
                .toArray();

            archive.append(
                JSON.stringify(documents, null, 2),
                {
                    name: `${collectionName}.json`,
                }
            );
        }

        archive.append(
            JSON.stringify(
                {
                    database: db.databaseName,
                    backupDate: new Date().toISOString(),
                    collections: collections.map(
                        (collection) => collection.name
                    ),
                    collectionCount: collections.length,
                },
                null,
                2
            ),
            {
                name: "backup-info.json",
            }
        );

        await archive.finalize();
    } catch (error) {

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Failed to backup database",
                error:
                    error instanceof AppError
                        ? error.message
                        : "Unknown error",
            });
        }
    }
};

export const BackupController = {
    backupDatabase,
};