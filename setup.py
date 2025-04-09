from setuptools import find_packages, setup

long_desc = """Toolkit for preprocessing raw time-spatial data (smoothing + segmentation) & calculating various quantitative measures on rat behaviour (which are afflicted with OCD)."""

setup(
    name="rBat",
    version="0.0.1",
    description="Preprocessing & Behavioural analysis toolkit for rats presenting OCD-like behaviour.",
    package_dir={"": "rBat"},
    packages=find_packages(where="rBat"),
    long_description=long_desc,
    url="https://github.com/brandonc-edu/RatBAT",
    license="MIT",
    install_requires=["numpy>=2.1.3", "shapely>=2.0.6", "scipy>=1.14.1"],
    extras_require={
        "dev" : ["pytest>=8.3.5", "twine>=6.1.0"]
    },
    python_requires=">=3.13.0"
)