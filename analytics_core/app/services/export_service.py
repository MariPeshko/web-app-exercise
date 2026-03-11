import csv
from datetime import datetime
from io import BytesIO, StringIO
from app.services.aggregation_service import get_kpis, get_timeseries

def export_csv(from_: datetime, to: datetime, mode: str | None = None, user_id: str | None = None):
    kpis = get_kpis(from_, to, mode=mode, user_id=user_id)
    ts = get_timeseries(
        metric="games_played",
        interval="day",
        from_=from_,
        to=to,
        mode=mode,
        user_id=user_id,
    )

    buffer = StringIO()
    writer = csv.writer(buffer)

    writer.writerow(["section", "key", "value"])
    for key, value in kpis.items():
        writer.writerow(["kpi", key, value])

    writer.writerow([])
    writer.writerow(["timeseries", "timestamp", "value"])
    for point in ts.get("points", []):
        writer.writerow(["games_played", point["timestamp"], point["value"]])

    return iter([buffer.getvalue().encode("utf-8")])

def export_pdf(from_: datetime, to: datetime):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    kpis = get_kpis(from_, to)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Analytics Report")
    y -= 25

    pdf.setFont("Helvetica", 10)
    pdf.drawString(50, y, f"Range: {from_.isoformat()} -> {to.isoformat()}")
    y -= 20

    for key, value in kpis.items():
        pdf.drawString(50, y, f"{key}: {value}")
        y -= 16
        if y < 50:
            pdf.showPage()
            y = height - 50

    pdf.save()
    buffer.seek(0)
    return iter([buffer.getvalue()])