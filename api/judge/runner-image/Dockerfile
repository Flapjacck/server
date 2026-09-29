FROM python:3.12-slim

RUN pip install --no-cache-dir pytest==8.3.4

WORKDIR /opt

COPY run_tests.py /opt/run_tests.py
COPY entrypoint.sh /opt/entrypoint.sh
COPY hidden/ /opt/hidden/

RUN chmod +x /opt/entrypoint.sh
RUN useradd --create-home --uid 1000 runner && chown -R runner:runner /opt

USER runner

ENTRYPOINT ["/opt/entrypoint.sh"]
