import { catchError } from '../../error/catchError.js';
import { Adder, TurboSearchKit } from '../../indexType.js';
import type { AdderManager, Ran } from './adderManagerType.js';
import type Z from 'zod';

export class adderManager implements AdderManager {

    private _adders;
    private _turboSearchKit;

    constructor(adders: Adder[], turboSearchKit: TurboSearchKit) {
        this._adders = adders;
        this._turboSearchKit = turboSearchKit;
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

    //実行
    async run(adderName: Adder["name"], input: object) {
        //adderを取得
        const adder = this._adders.find(adder => adder.name === adderName);
        if (adder) {
            //inputのスキーマを取得
            const inputSchema = adder.inputSchema;
            //zodでinputのスキーマをチェック
            const inputSchemaCheckResult = inputSchema.safeParse(input);
            if (!inputSchemaCheckResult.success) {
                return {
                    success: false,
                    message: "The input does not match the input schema of adder:" + adderName + ".",
                    error: inputSchemaCheckResult.error,
                    ran: []
                } as { success: false, message: string, error: Z.ZodError<any>, ran: Ran[] }
            } else {
                const safeInput = inputSchemaCheckResult.data;
                const ranList: Ran[] = [];

                //実行処理
                //TODO:実行処理を実装する
                //adder.pipes.coreToCrawler
                const toCrawler = adder.pipes.coreToCrawler.length > 0 ? await this.runCoreToCrawler(adder, safeInput) : safeInput;
                ranList.push("coreToCrawler");

                //adder.crawler
                const toCrawlerToIndexer = adder.crawler ? await this.runCrawler(adder, toCrawler) : toCrawler;
                ranList.push("crawler");

                //adder.pipes.crawlerToIndexer
                const toIndexer = adder.pipes.crawlerToIndexer.length > 0 ? await this.runCrawlerToIndexer(adder, toCrawlerToIndexer) : toCrawlerToIndexer;
                ranList.push("crawlerToIndexer");

                //adder.indexer
                const toIndexerToCore = adder.indexer ? await this.runIndexer(adder, toIndexer) : toIndexer;
                ranList.push("indexer");

                //adder.pipes.indexerToCore
                const toCore = adder.pipes.indexerToCore.length > 0 ? await this.runIndexerToCore(adder, toIndexerToCore) : toIndexerToCore;
                ranList.push("indexerToCore");

                //outputのスキーマを取得
                const outputSchema = adder.outputSchema;
                //zodでoutputのスキーマをチェック
                const outputSchemaCheckResult = outputSchema.safeParse(toCore);
                if (!outputSchemaCheckResult.success) {
                    return {
                        success: false,
                        message: "The output does not match the output schema of adder:" + adderName + ".",
                        error: outputSchemaCheckResult.error,
                        ran: ranList
                    } as { success: false, message: string, error: Z.ZodError<any>, ran: Ran[] }
                } else {
                    const safeOutput = outputSchemaCheckResult.data;
                    return {
                        success: true,
                        output: safeOutput,
                        ran: ranList
                    } as { success: true, output: object, ran: Ran[] }
                }
            }
        } else {
            return {
                success: false,
                message: "The adder:" + adderName + " does not exist.",
                ran: []
            } as { success: false, message: string, ran: Ran[] }
        }
    }

    //coreToCrawlerを実行する
    async runCoreToCrawler(adder: Adder, input: object) {
        //pipe.coreToCrawlerを取得する
        const coreToCrawler = adder.pipes.coreToCrawler;
        if (typeof coreToCrawler === "undefined" || !coreToCrawler || coreToCrawler.length === 0) {
            return { success: true, data: input } as { success: true, data: object };
        } else {
            let output: { success: true, data: object } | { success: false, message: string, error: Z.ZodError<any> } = { success: true, data: input };
            for (const pipe of coreToCrawler) {
                if (!output.success) {
                    break;
                }

                //スキーマをチェック
                const schemaCheckResult = pipe.inputSchema.safeParse(output);
                if (!schemaCheckResult.success) {
                    output = {
                        success: false,
                        message: "The output does not match the input schema of pipe:" + pipe.name + ".",
                        error: schemaCheckResult.error
                    }
                } else {
                    // 実行する
                    const ranData = await pipe.process(schemaCheckResult.data, this._turboSearchKit);
                    if (ranData.success) {
                        output = {
                            success: true,
                            data: ranData.output
                        }
                    } else {
                        output = {
                            success: false,
                            message: ranData.message,
                            error: ranData.error
                        }
                    }
                }
            }
            return output;
        }
    }

    //crawlerToIndexerを実行する
    async runCrawlerToIndexer(adder: Adder, input: object) {
        //pipe.crawlerToIndexerを取得する
        const crawlerToIndexer = adder.pipes.crawlerToIndexer;
        if (typeof crawlerToIndexer === "undefined" || !crawlerToIndexer || crawlerToIndexer.length === 0) {
            return { success: true, data: input } as { success: true, data: object };
        } else {
            let output: { success: true, data: object } | { success: false, message: string, error: Z.ZodError<any> } = { success: true, data: input };
            for (const pipe of crawlerToIndexer) {
                if (!output.success) {
                    break;
                }

                //スキーマをチェック
                const schemaCheckResult = pipe.inputSchema.safeParse(output);
                if (!schemaCheckResult.success) {
                    output = {
                        success: false,
                        message: "The output does not match the input schema of pipe:" + pipe.name + ".",
                        error: schemaCheckResult.error
                    }
                } else {
                    //実行する
                    const ranData = await pipe.process(schemaCheckResult.data, this._turboSearchKit);
                    if (ranData.success) {
                        output = {
                            success: true,
                            data: ranData.output
                        }
                    } else {
                        output = {
                            success: false,
                            message: ranData.message,
                            error: ranData.error
                        }
                    }
                }
            }
            return output;
        }
    }

    //indexerToCoreを実行する
    async runIndexerToCore(adder: Adder, input: object) {
        //pipe.indexerToCoreを取得する
        const indexerToCore = adder.pipes.indexerToCore;
        if (typeof indexerToCore === "undefined" || !indexerToCore || indexerToCore.length === 0) {
            return { success: true, data: input } as { success: true, data: object };
        } else {
            let output: { success: true, data: object } | { success: false, message: string, error: Z.ZodError<any> } = { success: true, data: input };
            for (const pipe of indexerToCore) {
                if (!output.success) {
                    break;
                }

                //スキーマをチェック
                const schemaCheckResult = pipe.inputSchema.safeParse(output);
                if (!schemaCheckResult.success) {
                    output = {
                        success: false,
                        message: "The output does not match the input schema of pipe:" + pipe.name + ".",
                        error: schemaCheckResult.error
                    }
                } else {
                    // 実行する
                    const ranData = await pipe.process(schemaCheckResult.data, this._turboSearchKit);
                    if (ranData.success) {
                        output = {
                            success: true,
                            data: ranData.output
                        }
                    } else {
                        output = {
                            success: false,
                            message: ranData.message,
                            error: ranData.error
                        }
                    }
                }
            }
            return output;
        }
    }

    //Crawlerを実行する
    async runCrawler(adder: Adder, input: object) {
        //crawlerを取得する
        const crawler = adder.crawler;
        if (typeof crawler === "undefined" || !crawler) {
            return { success: true, data: input } as { success: true, data: object };
        } else {
            let output: { success: true, data: object } | { success: false, message: string, error: Z.ZodError<any> } = { success: true, data: input };
            //スキーマをチェック
            const schemaCheckResult = crawler.inputSchema.safeParse(output);
            if (!schemaCheckResult.success) {
                output = {
                    success: false,
                    message: "The output does not match the input schema of pipe:" + crawler.name + ".",
                    error: schemaCheckResult.error
                }
            } else {
                // 実行する
                const ranData = await crawler.process(schemaCheckResult.data, this._turboSearchKit);
                if (ranData.success) {
                    output = {
                        success: true,
                        data: ranData.output
                    }
                } else {
                    output = {
                        success: false,
                        message: ranData.message,
                        error: ranData.error
                    }
                }
            }
            return output;
        }
    }

    //Indexerを実行する
    async runIndexer(adder: Adder, input: object) {
        //indexerを取得する
        const indexer = adder.indexer;
        if (typeof indexer === "undefined" || !indexer) {
            return { success: true, data: input } as { success: true, data: object };
        } else {
            let output: { success: true, data: object } | { success: false, message: string, error: Z.ZodError<any> } = { success: true, data: input };
            //スキーマをチェック
            const schemaCheckResult = indexer.inputSchema.safeParse(output);
            if (!schemaCheckResult.success) {
                output = {
                    success: false,
                    message: "The output does not match the input schema of pipe:" + indexer.name + ".",
                    error: schemaCheckResult.error
                }
            } else {
                // 実行する
                const ranData = await indexer.process(schemaCheckResult.data, this._turboSearchKit);
                if (ranData.success) {
                    output = {
                        success: true,
                        data: ranData.output
                    }
                } else {
                    output = {
                        success: false,
                        message: ranData.message,
                        error: ranData.error
                    }
                }
            }
            return output;
        }
    }

}