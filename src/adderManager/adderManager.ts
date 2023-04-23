import { catchError } from '../error/catchError.js';
import { Adder } from '../indexType.js';
import type { AdderManager } from './adderManagerType.js';

export class adderManager implements AdderManager {

    private _adders;

    constructor(adders: Adder[]) {
        this._adders = adders;
    }

    checkSchema() {
        this._adders.forEach(adder => {
            //まずpipeのスキーマの整合性をチェックする

            //coreToCrawler
            adder.pipes.coreToCrawler.forEach((pipe, index: number) => {
                if (index === adder.pipes.coreToCrawler.length - 2) {
                    return;
                }
                if (pipe.outputSchema !== adder.pipes.coreToCrawler[index + 1].inputSchema) {
                    catchError("pipe",
                        [
                            "The output schema of " + pipe.name + ", a Adder:" + adder.name + " pipe, does not match the input schema of " + adder.pipes.coreToCrawler[index + 1].name + ".",
                            "Location:adder[?].pipes.coreToCrawler",
                            pipe.name + " and " + adder.pipes.coreToCrawler[index + 1].name + " pipes cannot be connected.",
                            "Solution : Either delete the corresponding pipe or install a data conversion pipe between " + pipe.name + " and " + adder.pipes.coreToCrawler[index + 1].name + "."
                        ]
                    )
                }
            });

            //crawlerToIndexer
            adder.pipes.crawlerToIndexer.forEach((pipe, index: number) => {
                if (index === adder.pipes.crawlerToIndexer.length - 2) {
                    return;
                }
                if (pipe.outputSchema !== adder.pipes.crawlerToIndexer[index + 1].inputSchema) {
                    catchError("pipe",
                        [
                            "The output schema of " + pipe.name + ", a Adder:" + adder.name + " pipe, does not match the input schema of " + adder.pipes.crawlerToIndexer[index + 1].name + ".",
                            "Location:adder[?].pipes.crawlerToIndexer",
                            pipe.name + " and " + adder.pipes.crawlerToIndexer[index + 1].name + " pipes cannot be connected.",
                            "Solution : Either delete the corresponding pipe or install a data conversion pipe between " + pipe.name + " and " + adder.pipes.crawlerToIndexer[index + 1].name + "."
                        ]
                    )
                }
            });

            //indexerToCore
            adder.pipes.indexerToCore.forEach((pipe, index: number) => {
                if (index === adder.pipes.indexerToCore.length - 2) {
                    return;
                }
                if (pipe.outputSchema !== adder.pipes.indexerToCore[index + 1].inputSchema) {
                    catchError("pipe",
                        [
                            "The output schema of " + pipe.name + ", a Adder:" + adder.name + " pipe, does not match the input schema of " + adder.pipes.indexerToCore[index + 1].name + ".",
                            "Location:adder[?].pipes.indexerToCore",
                            pipe.name + " and " + adder.pipes.indexerToCore[index + 1].name + " pipes cannot be connected.",
                            "Solution : Either delete the corresponding pipe or install a data conversion pipe between " + pipe.name + " and " + adder.pipes.indexerToCore[index + 1].name + "."
                        ]
                    )
                }
            });

            //adder.inputSchemaとadder.pipes.coreToCrawler[0].inputSchemaの整合性をチェックする
            if (adder.inputSchema !== adder.pipes.coreToCrawler[0].inputSchema) {
                catchError("adder",
                    [
                        "The input schema of adder:" + adder.name + " does not match the input schema of coreToCrawler."
                    ]
                )
            }

            //adder.pipes.coreToCrawler[adder.pipes.coreToCrawler.length - 1].outputSchemaとadder.crawler.inputSchemaの整合性をチェックする
            if (adder.pipes.coreToCrawler[adder.pipes.coreToCrawler.length - 1].outputSchema !== adder.crawler.inputSchema) {
                catchError("adder",
                    [
                        "The output schema of coreToCrawler does not match the input schema of crawler:" + adder.crawler.name + "."
                    ]
                )
            }

            //adder.crawler.outputSchemaとadder.pipes.crawlerToIndexer[0].inputSchemaの整合性をチェックする
            if (adder.crawler.outputSchema !== adder.pipes.crawlerToIndexer[0].inputSchema) {
                catchError("adder",
                    [
                        "The output schema of crawler:" + adder.crawler.name + " does not match the input schema of crawlerToIndexer."
                    ]
                )
            }

            //adder.pipes.crawlerToIndexer[adder.pipes.crawlerToIndexer.length - 1].outputSchemaとadder.indexer.inputSchemaの整合性をチェックする
            if (adder.pipes.crawlerToIndexer[adder.pipes.crawlerToIndexer.length - 1].outputSchema !== adder.indexer.inputSchema) {
                catchError("adder",
                    [
                        "The output schema of crawlerToIndexer does not match the input schema of indexer:" + adder.indexer.name + "."
                    ]
                )
            }

            //adder.indexer.outputSchemaとadder.pipes.indexerToCore[0].inputSchemaの整合性をチェックする
            if (adder.indexer.outputSchema !== adder.pipes.indexerToCore[0].inputSchema) {
                catchError("adder",
                    [
                        "The output schema of indexer:" + adder.indexer.name + " does not match the input schema of indexerToCore."
                    ]
                )
            }

            //adder.pipes.indexerToCore[adder.pipes.indexerToCore.length - 1].outputSchemaとadder.outputSchemaの整合性をチェックする
            if (adder.pipes.indexerToCore[adder.pipes.indexerToCore.length - 1].outputSchema !== adder.outputSchema) {
                catchError("adder",
                    [
                        "The output schema of indexerToCore does not match the output schema of adder:" + adder.name + "."
                    ]
                )
            }

        });
    }

}