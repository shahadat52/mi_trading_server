import puppeteer from "puppeteer";

// Currency formatter
const formatAmount = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export const generatePdf = async (
    customers: any
): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        const totalDue = customers.reduce(
            (sum: any, customer: any) =>
                sum + Number(customer.totalDue || 0),
            0
        );

        const rows = customers
            .map(
                (customer: any, index: number) => `
                    <tr>
                        <td class="sl">
                            ${index + 1}
                        </td>

                        <td>
                            ${customer.name || "-"}
                        </td>

                        <td>
                            ${customer.phone || "-"}
                        </td>

                        <td>
                            ${customer.address || "-"}
                        </td>

                        <td class="amount">
                            ${formatAmount(customer.totalDue)}
                        </td>
                    </tr>
                `
            )
            .join("");

        const html = `
            <!DOCTYPE html>

            <html lang="bn">

            <head>

                <meta charset="UTF-8">

                <title>Customer Due Report</title>

                <style>

                    @font-face {
                        font-family: "Noto Serif Bengali";

                        src: url("file:///C:/YOUR_PROJECT/fonts/NotoSerifBengali-Regular.ttf")
                            format("truetype");

                        font-weight: 400;
                    }

                    @font-face {
                        font-family: "Noto Serif Bengali";

                        src: url("file:///C:/YOUR_PROJECT/fonts/NotoSerifBengali-Bold.ttf")
                            format("truetype");

                        font-weight: 700;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;

                        font-family:
                            "Noto Serif Bengali",
                            "Noto Sans Bengali",
                            sans-serif;

                        font-size: 12px;

                        color: #111;
                    }

                    .header {
                        text-align: center;

                        margin-bottom: 20px;
                    }

                    .title {
                        font-size: 22px;

                        font-weight: 700;

                        margin: 0 0 5px 0;
                    }

                    .generated {
                        font-size: 10px;

                        color: #555;
                    }

                    table {
                        width: 100%;

                        border-collapse: collapse;

                        table-layout: fixed;
                    }

                    th,
                    td {
                        border: 1px solid #444;

                        padding: 7px 8px;

                        vertical-align: middle;

                        word-wrap: break-word;
                    }

                    th {
                        font-weight: 700;

                        text-align: center;

                        background: #f2f2f2;
                    }

                    .sl {
                        width: 7%;

                        text-align: center;
                    }

                    .customer {
                        width: 22%;
                    }

                    .phone {
                        width: 18%;
                    }

                    .address {
                        width: 35%;
                    }

                    .due {
                        width: 18%;
                    }

                    .amount {
                        text-align: right;

                        font-weight: 700;
                    }

                    .total {
                        margin-top: 15px;

                        text-align: right;

                        font-size: 15px;

                        font-weight: 700;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        page-break-inside: avoid;
                    }

                </style>

            </head>

            <body>

                <div class="header">

                    <div class="title">
                        Customer Due Report
                    </div>

                    <div class="generated">
                        Generated:
                        ${new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
        })}
                    </div>

                </div>


                <table>

                    <thead>

                        <tr>

                            <th class="sl">
                                SL
                            </th>

                            <th class="customer">
                                Customer
                            </th>

                            <th class="phone">
                                Phone
                            </th>

                            <th class="address">
                                Address
                            </th>

                            <th class="due">
                                Total Due
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>


                <div class="total">

                    Total Customer Due:
                    ${formatAmount(totalDue)}

                </div>

            </body>

            </html>
        `;

        await page.setContent(html, {
            waitUntil: "domcontentloaded",
        });


        // await new Promise((resolve) => setTimeout(resolve, 500));

        await page.pdf({
            format: "A4",
            printBackground: true,
        });

        // Wait until fonts are fully loaded
        await page.evaluate(async () => {
            await document.fonts.ready;
        });

        const pdf = await page.pdf({
            format: "A4",

            printBackground: true,

            preferCSSPageSize: false,

            margin: {
                top: "12mm",
                right: "10mm",
                bottom: "12mm",
                left: "10mm",
            },

            displayHeaderFooter: true,

            headerTemplate: `
                <div></div>
            `,

            footerTemplate: `
                <div
                    style="
                        width: 100%;
                        text-align: center;
                        font-size: 9px;
                        color: #666;
                    "
                >
                    Page
                    <span class="pageNumber"></span>
                    /
                    <span class="totalPages"></span>
                </div>
            `,
        });

        return Buffer.from(pdf);

    } finally {

        await browser.close();
    }
};